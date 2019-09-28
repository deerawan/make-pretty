import { Project } from '../project';
import { configureForEslint } from '../prettier';

export class NodeJs extends Project {
  public static projectId = 'node_js';
  public static projectName = 'Node JS';

  constructor() {
    super();
  }

  public runExtra(targetDir: string) {
    this.copyTemplates(NodeJs.projectName, __dirname, targetDir);
    return configureForEslint(targetDir);
  }
}
