import {Project} from './project';
import * as fs from 'fs';
import {installDevPackages} from '../util';
const editJsonFile = require('edit-json-file');

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
    const tslintStats = fs.statSync(tslintFilePath);
    if (tslintStats.isFile()) {
      console.log('🔍 tslint.json exist, adding tslint-config-prettier...');
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
