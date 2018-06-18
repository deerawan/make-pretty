const copy = require('copy');
const inquirer = require('inquirer');
const npmInstallPackage = require('npm-install-package');
const editJsonFile = require('edit-json-file');
const {promisify} = require("es6-promisify");

const copyEach = promisify(copy.each);
const templateDir = `${__dirname}/templates`;

const packageJsonPath = `${__dirname}/package.json`;
console.log('package json found', packageJsonPath);
let packageFile = editJsonFile(packageJsonPath);

const devDeps = [
  'lint-staged',
  'husky'
];

const questions = [
  {
    type: 'list',
    name: 'language',
    message: 'What language is it?',
    choices: ['Javascript', 'Typescript'],
    filter: function(val) {
      return val.toLowerCase();
    }
  }
];

inquirer.prompt(questions).then(answers => {  
  console.log(JSON.stringify(answers, null, '  '));

  console.log('install dev dependencies');
  npmInstallPackage(devDeps, {
    saveDev: true,    
  }, function(err) {
    if (err) {
      throw err;
    }
    modifyPackageFile();
  });  
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

  packageFile.save();
}

function copyPrettierTemplates() {
  
  copyEach([
    `${templateDir}/.prettierignore`,
    `${templateDir}/.prettierrc`
  ])
}