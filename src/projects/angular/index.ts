import { Project } from '../project';
import { configureForTslint } from '../prettier';

export class Angular extends Project {
  public static projectId = 'angular';
  public static projectName = 'Angular';

  constructor() {
    super();
  }

  public runExtra(targetDir: string) {
    super.copyTemplates(Angular.projectName, __dirname, targetDir);
    return configureForTslint(targetDir);
  }
}
