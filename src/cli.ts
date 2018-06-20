#!/usr/bin/env node

import * as inquirer from 'inquirer';
import { promisify } from 'es6-promisify';
import * as cpx from 'cpx';
import { init, ProjectId, Project, getChoices } from './projects';
import { installDevPackages } from './util';

const editJsonFile = require('edit-json-file');
const copy = promisify(cpx.copy);

const targetDir = process.cwd();
console.log('target directory', targetDir);
const packageJsonPath = `${targetDir}/package.json`;
console.log('package json found', packageJsonPath);
const packageFile = editJsonFile(packageJsonPath);

const sourceDir = __dirname;
const templateDir = `${sourceDir}/templates`;
console.log('templates directory', templateDir);

const requiredDevDeps = [
  'pretty-quick',
  'husky',
  'prettier',
];

enum QuestionName {
  Project = 'project',
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
    },
  },
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
      modifyPackageFile(project),
      project.runExtra(targetDir),
    ]))
    .catch((err: Error) => {
      throw err;
    });
});

function modifyPackageFile(project: Project) {
  const prettierFiles = project.getPrettierFiles();
  const baseFormatCommand = `prettier --config ./.prettierrc \"${prettierFiles}\"`;

  console.log('modifying package json file');
  const jsonTemplate = {
    scripts: {
      'precommit': 'pretty-quick --staged',
      'format': `${baseFormatCommand} --write`,
      'format-check': `${baseFormatCommand} --list-different`,
    },
  };
  packageFile.set('scripts.precommit', jsonTemplate.scripts.precommit);
  packageFile.set('scripts.format', jsonTemplate.scripts.format);
  packageFile.set('scripts.format-check', jsonTemplate.scripts['format-check']);

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
  .catch((err: Error) => {
    throw err;
  });
}