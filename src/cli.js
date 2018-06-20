const inquirer = require('inquirer');
const npmInstallPackage = require('npm-install-package');
const editJsonFile = require('edit-json-file');
const {promisify} = require("es6-promisify");
const cpx = require('cpx');
const chalk = require('chalk');
const fs = require('fs');
const warning = chalk.keyword('orange');

const copy = promisify(cpx.copy);
const templateDir = `${__dirname}/templates`;
console.log('templates directory', templateDir);

const currentDir = __dirname;
const packageJsonPath = `${currentDir}/package.json`;
console.log('package json found', packageJsonPath);
let packageFile = editJsonFile(packageJsonPath);

const requiredDevDeps = [
  'lint-staged',
  'husky',
  'prettier'
];

const questions = [
  {
    type: 'list',
    name: 'language',
    message: 'What language is it?',
    choices: ['Javascript', 'Typescript'],
    filter(val) {
      return val.toLowerCase();
    }
  }
];

inquirer.prompt(questions).then(answers => {  
  console.log(JSON.stringify(answers, null, '  '));

  if (answers.language === 'typescript') {

  }

  console.log('install dev dependencies');
  return installDevPackages(requiredDevDeps)
    .then(() => Promise.all([      
      copyPrettierTemplates(),
      modifyPackageFile()
    ]))
    .catch(err => {
      throw err;
    })
});

function modifyPackageFile() {
  console.log('modifying package json file');
  const jsonTemplate = {
    "scripts": {
      "precommit": "lint-staged"
    },
    "lint-staged": {
      "*.{js,json,css,md}": ["prettier --write", "git add"]
    }
  };
  packageFile.set('scripts.precommit', jsonTemplate['scripts']['precommit']);
  packageFile.set('lint-staged', jsonTemplate['lint-staged']);

  return new Promise((resolve, reject) => {
    packageFile.save(err => {
      if (err) {
        reject(err);
      }
      
      resolve();
    });  
  });
}

function copyPrettierTemplates() {
  console.log('copying prettier files');
  return copy(`${templateDir}/.*`, currentDir)
  .then(() => {
    console.log('prettier files are copied');
    return Promise.resolve();
  })
  .catch(err => {
    throw err;
  })
}

function configurePrettierForTypescript() {
  const tslintFilePath = `${currentDir}/.tslint.json`;
  const tslintStats = fs.statSync(tslintFilePath);
  if (tslintStats.isFile()) {
    console.log(warning('tslint.json is exist, adding tslint-config-prettier to `extends`...'));      
    return installDevPackages(['tslint-config-prettier'])
      .then(() => {
        const tslintFile = editJsonFile(tslintFilePath);
        const currentExtends = tslintFile.get('extends');
        const newExtends = [...currentExtends, 'tslint-config-prettier'];
        tslintFile.set('extends', newExtends);  

        return Promise.resolve();
      })
  }

  return Promise.resolve();
}

function installDevPackages(packages) {
  return new Promise((resolve, reject) => {    
    npmInstallPackage(packages, {
      saveDev: true,    
    }, function(err) {
      if (err) {
        console.log('woi error');
        reject(err);
      }
      resolve();
    });  
  });
}