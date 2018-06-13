const inquirer = require('inquirer');
const npmInstallPackage = require('npm-install-package');
const editJsonFile = require('edit-json-file');
let packageFile = editJsonFile(`${__dirname}/package.json`);


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
  console.log('\nOrder receipt:');
  console.log(JSON.stringify(answers, null, '  '));

  npmInstallPackage(devDeps, {
    saveDev: true,
    cache: true
  }, done);

  modifyPackageFile();

});

function modifyPackageFile() {
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