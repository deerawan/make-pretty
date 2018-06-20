const childProcess = require("child_process");
const { promisify } = require("es6-promisify");
const editJsonFile = require("edit-json-file");
const cpx = require("cpx");
const fs = require("fs");
const inquirer = require("inquirer");
const inquirerTest = require("inquirer-test");

// NOTE: must set test folder as working directory
process.chdir(process.cwd() + "/__test__");
console.log("target directory", process.cwd());

const copy = promisify(cpx.copy);
const timeout = 15000;
const currentDir = __dirname;
const cliPath = `${currentDir}/../src/cli.js`;
let file;

function reset() {
  const copyOptions = {};
  cleanFiles();
  return Promise.all([
    copy(`${currentDir}/fixtures/*.json`, currentDir, copyOptions)
  ]);
}

function cleanFiles() {
  childProcess.execSync("git clean -x -f", {
    cwd: currentDir,
    stdio: [0, 1, 2]
  });
  childProcess.execSync('rm -rf node_modules', { cwd: currentDir, stdio: [0, 1, 2] })
}

afterAll(() => {
  cleanFiles();
})

describe("Javascript language is chosen", function() {
  let result;
  let packageFile;

  beforeAll(async () => {
    await reset();
    result = await inquirerTest([cliPath], [inquirerTest.ENTER]);
    console.log(result);
    packageFile = editJsonFile(`${currentDir}/package.json`);
  }, timeout);

  test("javascript is chosen", () => {
    expect(result).toMatch("javascript");
  });

  test("has pretty-quick to run in precommit", () => {
    expect(packageFile.get("scripts.precommit")).toEqual("pretty-quick --staged");
  });

  test('has format commands', () => {
    expect(packageFile.get("scripts.format")).toEqual("prettier --config ./.prettierrc \"*.{js,json}\" --write");
    expect(packageFile.get("scripts.format:check")).toEqual("prettier --config ./.prettierrc \"*.{js,json}\" --list-different");
  })

  test("has prettier configuration files", () => {
    const prettierIgnoreStats = fs.statSync(`${currentDir}/.prettierignore`);
    const prettierRcStats = fs.statSync(`${currentDir}/.prettierrc`);

    expect(prettierIgnoreStats.isFile()).toEqual(true);
    expect(prettierRcStats.isFile()).toEqual(true);
  });
});

describe.skip("Typescript language is chosen", function() {
  let result;
  let packageFile;
  let tslintFile;

  beforeAll(async () => {
    await reset();
    result = await inquirerTest(
      [cliPath],
      [inquirerTest.DOWN, inquirerTest.ENTER]
    );
    console.log(result);
    tslintFile = editJsonFile(`${currentDir}/tslint.json`);
    packageFile = editJsonFile(`${currentDir}/package.json`);
    console.log("tslint files", tslintFile);
    console.log("package files", packageFile);
  }, timeout);

  test("typescript is chosen", () => {
    expect(result).toMatch("typescript");
  });

  test("has tslint-config-prettier in tslint.json", () => {
    expect(tslintFile.get("extends")).toEqual("hehe");
  });

  test("has pretty-quick to run in precommit", () => {
    expect(packageFile.get("scripts.precommit")).toEqual("pretty-quick --staged");
  });

  test("has prettier configuration files", () => {
    const prettierIgnoreStats = fs.statSync(`${currentDir}/.prettierignore`);
    const prettierRcStats = fs.statSync(`${currentDir}/.prettierrc`);

    expect(prettierIgnoreStats.isFile()).toEqual(true);
    expect(prettierRcStats.isFile()).toEqual(true);
  });
});
