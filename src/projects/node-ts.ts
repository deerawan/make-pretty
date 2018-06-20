import { Project } from './project';

export class NodeTs extends Project {
  public static projectId = 'node_ts';
  public static projectName = 'Node TS';

  constructor() {
    super();
    this.prettierFiles = '*.{ts,json}';
  }
}
