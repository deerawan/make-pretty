import {Project} from './project';
import * as fs from 'fs';
import * as chalk from 'chalk';
import {installDevPackages} from '../util';
const editJsonFile = require('edit-json-file');

const warning = chalk.default.keyword('orange');

export class NodeTs extends Project {
  public static projectId = 'node_ts';
  public static projectName = 'Node TS';

  constructor() {
    super();
    this.prettierFiles = '**/*.{ts,json}';
  }

  public runExtra(targetDir: string) {
    return this.configurePrettierForTypescript(targetDir);
  }

  private configurePrettierForTypescript(targetDir: string) {
    const tslintFilePath = `${targetDir}/tslint.json`;
    console.log('tslint path', tslintFilePath);
    const tslintStats = fs.statSync(tslintFilePath);
    if (tslintStats.isFile()) {
      console.log(
        warning(
          'tslint.json is exist, adding tslint-config-prettier to `extends`...',
        ),
      );
      return installDevPackages(['tslint-config-prettier']).then(() => {
        const tslintFile = editJsonFile(tslintFilePath);
        const currentExtends = tslintFile.get('extends') || [];
        const newExtends = currentExtends.includes('tslint-config-prettier')
          ? currentExtends
          : [...currentExtends, 'tslint-config-prettier'];
        tslintFile.set('extends', newExtends);

        return new Promise((resolve, reject) => {
          tslintFile.save((err: Error) => {
            if (err) {
              reject(err);
            }

            resolve();
          });
        });
      });
    } else {
      return Promise.resolve();
    }
  }
}
