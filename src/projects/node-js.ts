import {Project} from './project';

export class NodeJs extends Project {
  public static projectId = 'node_js';
  public static projectName = 'Node JS';

  constructor() {
    super();
    this.prettierFiles = '**/*.{js,json}';
  }

  public runExtra(targetDir: string) {
    return Promise.resolve();
  }
}
