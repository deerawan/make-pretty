// tslint:disable no-console

import { promisify } from 'es6-promisify';
import * as cpx from 'cpx';
import * as fs from 'fs';
import { removeFiles } from '../test-helper';

const editJsonFile = require('edit-json-file');
const inquirerTest = require('inquirer-test');
const copy = promisify(cpx.copy);

const timeout = 25000;
const currentDir = __dirname;
const targetDir = `${currentDir}/execution`;
const cliPath = `${currentDir}/../../src/cli.js`;

// NOTE: must set test folder as working directory
process.chdir(targetDir);
console.log('target directory', process.cwd());

describe('Angular project', () => {
  let result: any;
  let packageFile: any;

  beforeAll(async () => {
    await prepareTest();
    result = await inquirerTest(
      [cliPath],
      [inquirerTest.DOWN, inquirerTest.DOWN, inquirerTest.ENTER],
    );
    console.log('inquirer result', result);
    packageFile = editJsonFile(`${targetDir}/package.json`);
  }, timeout);

  test('angular is chosen', () => {
    expect(result).toMatch('Angular');
  });

  test('add lint-staged to run in precommit', () => {
    expect(packageFile.get('scripts.precommit')).toEqual('lint-staged');
  });

  test('add lint-staged configuration file', () => {
    const lintStagedFile = fs.statSync(`${targetDir}/.lintstagedrc`);
    expect(lintStagedFile.isFile()).toEqual(true);
  });

  test('add format commands', () => {
    const baseCommand = 'prettier';
    expect(packageFile.get('scripts.format')).toEqual(`${baseCommand} --write`);
    expect(packageFile.get('scripts.format:check')).toEqual(
      `${baseCommand} --check`,
    );
  });

  test('has prettier configuration files', () => {
    const prettierIgnoreStats = fs.statSync(`${targetDir}/.prettierignore`);
    const prettierRcStats = fs.statSync(`${targetDir}/.prettierrc`);

    expect(prettierIgnoreStats.isFile()).toEqual(true);
    expect(prettierRcStats.isFile()).toEqual(true);
  });
});

function prepareTest() {
  removeFiles(targetDir);
  return Promise.all([copy(`${currentDir}/fixtures/*.json`, targetDir)]);
}
