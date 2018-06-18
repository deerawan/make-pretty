const copy = require('copy');
const childProcess = require('child_process');
const {promisify} = require("es6-promisify");
const editJsonFile = require('edit-json-file');

const copyOne = promisify(copy.one);
let file;

beforeAll(done => {
  const currentDir = __dirname;  
  const copyOptions = { flatten: true };  
  Promise.all([
    copyOne(`${currentDir}/fixtures/package.json`, currentDir, copyOptions),
    copyOne(`${currentDir}/../src/cli.js`, currentDir, copyOptions)
  ])
  .then(() => { 
    childProcess.execSync('node cli.js', { cwd: currentDir, stdio: [0, 1, 2]});
    file = editJsonFile(`${currentDir}/package.json`);
    done()
  });
});

test('has lint-staged to run in precommit', () => {  
  expect(file.get("scripts.precommit")).toEqual('lint-staged');
});

test('has lint-staged configuration', () => {
  expect(file.get("lint-staged")).toEqual({
    "*.{js,json,css,md}": ["prettier --write", "git add"]
  });
})
