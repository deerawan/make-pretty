// tslint:disable no-console

import { promisify } from 'es6-promisify';
import * as cpx from 'cpx';
import * as fs from 'fs';
import * as childProcess from 'child_process';

const editJsonFile = require('edit-json-file');
const inquirerTest = require('inquirer-test');

// NOTE: must set test folder as working directory
process.chdir(process.cwd() + '/__test__');
console.log('target directory', process.cwd());

const copy = promisify(cpx.copy);
const timeout = 15000;
const currentDir = __dirname;
const cliPath = `${currentDir}/../src/cli.js`;

function reset() {
  cleanFiles();
  return Promise.all([
    copy(`${currentDir}/fixtures/*.json`, currentDir),
  ]);
}

function cleanFiles() {
  childProcess.execSync('git clean -x -f', {
    cwd: currentDir,
    stdio: [0, 1, 2],
  });
  childProcess.execSync('rm -rf node_modules', { cwd: currentDir, stdio: [0, 1, 2] });
}

afterAll(() => {
  cleanFiles();
});

describe('Node JS project', () => {
  let result: any;
  let packageFile: any;

  beforeAll(async () => {
    await reset();
    result = await inquirerTest([cliPath], [inquirerTest.ENTER]);
    console.log(result);
    packageFile = editJsonFile(`${currentDir}/package.json`);
  }, timeout);

  test('node_js is chosen', () => {
    expect(result).toMatch('node_js');
  });

  test('has pretty-quick to run in precommit', () => {
    expect(packageFile.get('scripts.precommit')).toEqual('pretty-quick --staged');
  });

  test('has format commands', () => {
    expect(packageFile.get('scripts.format')).toEqual('prettier --config ./.prettierrc \"*.{js,json}\" --write');
    expect(packageFile.get('scripts.format-check'))
    .toEqual('prettier --config ./.prettierrc \"*.{js,json}\" --list-different');
  });

  test('has prettier configuration files', () => {
    const prettierIgnoreStats = fs.statSync(`${currentDir}/.prettierignore`);
    const prettierRcStats = fs.statSync(`${currentDir}/.prettierrc`);

    expect(prettierIgnoreStats.isFile()).toEqual(true);
    expect(prettierRcStats.isFile()).toEqual(true);
  });
});

describe('Node TS', () => {
  let result: any;
  let packageFile: any;
  let tslintFile: any;

  beforeAll(async () => {
    await reset();
    result = await inquirerTest(
      [cliPath],
      [inquirerTest.DOWN, inquirerTest.ENTER],
    );
    console.log(result);
    tslintFile = editJsonFile(`${currentDir}/tslint.json`);
    packageFile = editJsonFile(`${currentDir}/package.json`);
    console.log('tslint files', tslintFile);
    console.log('package files', packageFile);
  }, timeout);

  test('node_ts is chosen', () => {
    expect(result).toMatch('node_ts');
  });

  test('has tslint-config-prettier in tslint.json', () => {
    expect(tslintFile.get('extends')).toEqual(['tslint:latest', 'tslint-config-prettier']);
  });

  test('has pretty-quick to run in precommit', () => {
    expect(packageFile.get('scripts.precommit')).toEqual('pretty-quick --staged');
  });

  test('has format commands', () => {
    const baseCommand = 'prettier --config ./.prettierrc "*.{ts,json}"';
    expect(packageFile.get('scripts.format')).toEqual(`${baseCommand} --write`);
    expect(packageFile.get('scripts.format-check'))
    .toEqual(`${baseCommand} --list-different`);
  });

  test('has prettier configuration files', () => {
    const prettierIgnoreStats = fs.statSync(`${currentDir}/.prettierignore`);
    const prettierRcStats = fs.statSync(`${currentDir}/.prettierrc`);

    expect(prettierIgnoreStats.isFile()).toEqual(true);
    expect(prettierRcStats.isFile()).toEqual(true);
  });
});
