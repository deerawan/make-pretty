#!/usr/bin/env node

import * as inquirer from 'inquirer';
import { promisify } from 'es6-promisify';
import * as cpx from 'cpx';
import * as chalk from 'chalk';
import * as fs from 'fs';
import { init, ProjectId, Project, getChoices } from './projects';

const npmInstallPackage = require('npm-install-package');
const editJsonFile = require('edit-json-file');
const warning = chalk.default.keyword('orange');
const copy = promisify(cpx.copy);

const targetDir = process.cwd();
console.log('target directory', targetDir);
const packageJsonPath = `${targetDir}/package.json`;
console.log('package json found', packageJsonPath);
let packageFile = editJsonFile(packageJsonPath);

const sourceDir = __dirname;
const templateDir = `${sourceDir}/templates`;
console.log('templates directory', templateDir);

const requiredDevDeps = [
  'pretty-quick',
  'husky',
  'prettier'
];

enum QuestionName {
  Project = 'project'
}

console.log('choices', getChoices());

const questions: inquirer.Questions = [
  {
    type: 'list',
    name: QuestionName.Project,
    message: 'What project is it?',
    choices: getChoices(),
    filter(val: string) {
      return val.toLowerCase();
    }
  }
];

interface Answer {
  [QuestionName.Project]: ProjectId;
}

inquirer.prompt(questions).then((answer: Answer) => {
  console.log(JSON.stringify(answer, null, '  '));

  const project: Project = init(answer[QuestionName.Project]);

  console.log('install dev dependencies');
  return installDevPackages(requiredDevDeps)
    .then(() => Promise.all([
      copyPrettierTemplates(),
      modifyPackageFile(project)
    ]))
    .catch((err: Error) => {
      throw err;
    })
});

function modifyPackageFile(project: Project) {
  const prettierFiles = project.getPrettierFiles();
  const baseFormatCommand = `prettier --config ./.prettierrc \"${prettierFiles}\"`;

  console.log('modifying package json file');
  const jsonTemplate = {
    "scripts": {
      "precommit": "pretty-quick --staged",
      "format": `${baseFormatCommand} --write`,
      "format-check": `${baseFormatCommand} --list-different`
    }
  };
  packageFile.set('scripts.precommit', jsonTemplate['scripts']['precommit']);
  packageFile.set('scripts.format', jsonTemplate['scripts']['format']);
  packageFile.set('scripts.format-check', jsonTemplate['scripts']['format-check']);

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
  console.log('copying prettier files');
  return copy(`${templateDir}/.*`, targetDir)
  .then(() => {
    console.log('prettier files are copied');
    return Promise.resolve();
  })
  .catch(err => {
    throw err;
  })
}

function configurePrettierForTypescript() {
  const tslintFilePath = `${targetDir}/tslint.json`;
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

function installDevPackages(packages: string[]) {
  return new Promise((resolve, reject) => {
    npmInstallPackage(packages, {
      saveDev: true,
    }, function(err: Error) {
      if (err) {
        console.log('woi error');
        reject(err);
      }
      resolve();
    });
  });
}