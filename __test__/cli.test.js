const childProcess = require('child_process');
const {promisify} = require("es6-promisify");
const editJsonFile = require('edit-json-file');
const cpx = require('cpx');
const fs = require('fs');
const inquirer = require('inquirer');
const inquirerTest = require('inquirer-test');

const copy = promisify(cpx.copy);
const timeout = 15000;
const currentDir = __dirname;  
const cliPath = `${currentDir}/cli.js`;
let file;

beforeAll(async () => {  
  const copyOptions = { };  
  childProcess.execSync('git clean -x -f', { cwd: currentDir, stdio: [0, 1, 2]});  
  await Promise.all([
    copy(`${currentDir}/fixtures/package.json`, currentDir, copyOptions),
    copy(`${currentDir}/../src/cli.js`, currentDir, copyOptions),    
    copy(`${currentDir}/../src/templates/.*`, `${currentDir}/templates`, copyOptions),    
  ]);    
}, timeout);

describe('Javascript language is chosen', function() {
  let result;
  let file;

  beforeAll(async () => {
    result = await inquirerTest([cliPath], [inquirerTest.ENTER]);    
    console.log(result);
    file = editJsonFile(`${currentDir}/package.json`);
  }, timeout);

  test('javascript is chosen', () => {
    expect(result).toMatch('javascript');
  })

  test('has lint-staged to run in precommit', () => {  
    expect(file.get("scripts.precommit")).toEqual('lint-staged');
  });

  test('has lint-staged configuration', () => {
    expect(file.get("lint-staged")).toEqual({
      "*.{js,json,css,md}": ["prettier --write", "git add"]
    });
  });

  test('has prettier configuration files', () => {
    const prettierIgnoreStats = fs.statSync(`${currentDir}/.prettierignore`);
    const prettierRcStats = fs.statSync(`${currentDir}/.prettierrc`);
    
    expect(prettierIgnoreStats.isFile()).toEqual(true);
    expect(prettierRcStats.isFile()).toEqual(true);
  })
});
