import { Project } from '../project';
import * as fs from 'fs';
import { installDevPackages } from '../../util';
import { initFile } from '../../file';

export class NodeJs extends Project {
  public static projectId = 'node_js';
  public static projectName = 'Node JS';

  constructor() {
    super();
  }

  public runExtra(targetDir: string) {
    this.copyTemplates(NodeJs.projectName, __dirname, targetDir);
    return this.configurePrettierForEslint(targetDir);
  }

  private async configurePrettierForEslint(targetDir: string) {
    const filename = 'eslint.json';

    try {
      const eslintFilePath = `${targetDir}/${filename}`;
      const eslintStats = fs.statSync(eslintFilePath);

      if (eslintStats.isFile()) {
        const libName = 'eslint-config-prettier';

        console.log(`🔍 ${filename} exists, adding ${libName}...`);

        await installDevPackages([libName]);
        await initFile(eslintFilePath).addLibToExtends(libName);
      }

      return Promise.resolve();
    } catch (error) {
      console.log(`🔍 ${filename} does not exist, skip...`);
      return Promise.resolve();
    }
  }
}
