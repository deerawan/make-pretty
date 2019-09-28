import * as fs from 'fs';
import { installDevPackages } from '../util';
import { initFile } from '../file';

export async function configureForTslint(targetDir: string): Promise<void> {
  const filename = 'tslint.json';
  return configureForLintFile(filename, 'tslint-config-prettier', targetDir);
}

export async function configureForEslint(targetDir: string): Promise<void> {
  const filename = 'eslint.json';
  return configureForLintFile(filename, 'eslint-config-prettier', targetDir);
}

async function configureForLintFile(
  lintFilename: string,
  configLibName: string,
  targetDir: string,
): Promise<void> {
  try {
    const lintFilePath = `${targetDir}/tslint.json`;
    const lintStats = fs.statSync(lintFilePath);

    if (lintStats.isFile()) {
      console.log(`🔍 ${lintFilename} exists, adding ${configLibName}...`);

      await installDevPackages([configLibName]);
      await initFile(lintFilePath).addLibToExtends(configLibName);
    }

    return Promise.resolve();
  } catch (error) {
    console.log(`🔍 ${lintFilename} does not exist, skip...`);
    return Promise.resolve();
  }
}
