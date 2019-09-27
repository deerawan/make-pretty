import { Project } from '../project';
import * as fs from 'fs';
import { installDevPackages } from '../../util';
import { initFile } from '../../file';

export class NodeTs extends Project {
  public static projectId = 'node_ts';
  public static projectName = 'Node TS';

  constructor() {
    super();
    this.prettierFiles = '**/*.{ts,json}';
  }

  public runExtra(targetDir: string) {
    super.copyTemplates(NodeTs.projectName, __dirname, targetDir);
    return this.configurePrettierForTslint(targetDir);
  }

  private async configurePrettierForTslint(targetDir: string): Promise<void> {
    const filename = 'tslint.json';

    try {
      const tslintFilePath = `${targetDir}/tslint.json`;
      const tslintStats = fs.statSync(tslintFilePath);

      if (tslintStats.isFile()) {
        const libName = 'tslint-config-prettier';

        console.log(`🔍 ${filename} exists, adding ${libName}...`);

        await installDevPackages([libName]);
        await initFile(tslintFilePath).addLibToExtends(libName);
      }
      return Promise.resolve();
    } catch (error) {
      console.log(`🔍 ${filename} does not exist, skip...`);
      return Promise.resolve();
    }
  }
}
