import { Project } from './project';
import { NodeJs } from './node-js';
import { NodeTs } from './node-ts';
import { Angular } from './angular';
import { ChoiceType } from 'inquirer';

export * from './project';
export enum ProjectId {
  NodeJs = 'node_js',
  NodeTs = 'node_ts',
  Angular = 'angular',
}

export function init(id: ProjectId): Project {
  switch (id) {
    case ProjectId.NodeJs:
      return new NodeJs();
    case ProjectId.NodeTs:
      return new NodeTs();
    case ProjectId.Angular:
      return new Angular();
    default:
      throw new Error('undefined project id');
  }
}

export function getChoices(): ChoiceType[] {
  const supportedProjects = [NodeJs, NodeTs, Angular];

  return supportedProjects.map((project: any) => ({
    name: project.projectName,
    value: project.projectId,
  }));
}
