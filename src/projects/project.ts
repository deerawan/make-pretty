import { promisify } from 'es6-promisify';
import * as cpx from 'cpx';
const copy = promisify(cpx.copy);

export abstract class Project {
  public static projectId: string;
  public static projectName: string;
  protected templateFolderName: string = `templates`;

  public abstract runExtra(targetDir: string): Promise<any>;

  public async copyTemplates(
    projectName: string,
    sourceDir: string,
    targetDir: string,
  ) {
    console.log(`🏮 copying ${projectName} template files`);
    const templateDir = `${sourceDir}/templates`;

    return await copy(`${templateDir}/.*`, targetDir);
  }
}
