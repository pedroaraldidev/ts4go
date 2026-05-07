export type IRNodeKind = 
  | 'Project'
  | 'Controller'
  | 'Route'
  | 'DTO'
  | 'Field'
  | 'Parameter'
  | 'Type'
  | 'HttpCall'
  | 'Return'
  | 'Assignment'
  | 'EnvVar';

export interface IRNode {
  kind: IRNodeKind;
}

export interface IRProject extends IRNode {
  kind: 'Project';
  controllers: IRController[];
  dtos: IRDTO[];
}

export interface IRController extends IRNode {
  kind: 'Controller';
  name: string;
  basePath: string;
  routes: IRRoute[];
}

export interface IRRoute extends IRNode {
  kind: 'Route';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handlerName: string;
  parameters: IRParameter[];
  body: IRStatement[];
}

export type IRStatement = IRHttpCall | IRReturn | IRAssignment | IREnvVar;

export interface IRAssignment extends IRNode {
  kind: 'Assignment';
  variableName: string;
  expression: IRNode;
}

export interface IREnvVar extends IRNode {
  kind: 'EnvVar';
  name: string;
}

export interface IRHttpCall extends IRNode {
  kind: 'HttpCall';
  method: string;
  url: string;
  dataVar?: string;
  resultVar?: string;
}

export interface IRReturn extends IRNode {
  kind: 'Return';
  value: any;
}

export interface IRParameter extends IRNode {
  kind: 'Parameter';
  name: string;
  type: IRType;
  in: 'query' | 'body' | 'path' | 'header';
}

export interface IRDTO extends IRNode {
  kind: 'DTO';
  name: string;
  fields: IRField[];
}

export interface IRField extends IRNode {
  kind: 'Field';
  name: string;
  type: IRType;
}

export interface IRType extends IRNode {
  kind: 'Type';
  name: string;
  isPrimitive: boolean;
  isArray: boolean;
}
