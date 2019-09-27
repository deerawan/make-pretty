#!/usr/bin/env node

import * as inquirer from 'inquirer';
import {promisify} from 'es6-promisify';
import * as cpx from 'cpx';
import {init, ProjectId, Project, getChoices} from './projects';
import {installDevPackages} from './util';

const editJsonFile = require('edit-json-file');
const copy = promisify(cpx.copy);

const targetDir = process.cwd();
console.log('🗃️ target directory', targetDir);
const packageJsonPath = `${targetDir}/package.json`;
const packageFile = editJsonFile(packageJsonPath);

const sourceDir = __dirname;
const templateDir = `${sourceDir}/templates`;
const requiredDevDeps = ['lint-staged', 'husky', 'prettier'];

enum QuestionName {
  Project = 'project',
}

const questions: inquirer.Questions = [
  {
    type: 'list',
    name: QuestionName.Project,
    message: 'What project is it?',
    choices: getChoices(),
  },
];

interface Answer {
  [QuestionName.Project]: ProjectId;
}

inquirer.prompt(questions).then((answer: Answer) => {
  const project: Project = init(answer[QuestionName.Project]);

  console.log('📦 installing base dev dependencies');
  return installDevPackages(requiredDevDeps)
    .then(() =>
      Promise.all([
        copyPrettierTemplates(),
        modifyPackageFile(project),
        project.runExtra(targetDir),
      ]),
    )
    .catch((err: Error) => {
      throw err;
    });
});

function modifyPackageFile(project: Project) {
  const baseFormatCommand = `prettier`;

  console.log('📗 adding some script commands in package.json');

  packageFile.set('scripts.precommit', 'lint-staged');
  packageFile.set('scripts.format', `${baseFormatCommand} --write`);
  packageFile.set('scripts.format:check', `${baseFormatCommand} --check`);

  return new Promise((resolve, reject) => {
    packageFile.save((err: Error) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

function copyPrettierTemplates() {
  console.log('🏮 generating prettier files');
  return copy(`${templateDir}/.*`, targetDir).then(() => Promise.resolve());
}
