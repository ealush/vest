export type IntegrationStatus =
  | 'planned'
  | 'local-red'
  | 'local-green'
  | 'docs-green'
  | 'ready-upstream'
  | 'upstream-rfc'
  | 'upstream-pr'
  | 'merged'
  | 'blocked';

export type IntegrationCategory =
  | 'specification'
  | 'form'
  | 'server'
  | 'router'
  | 'configuration'
  | 'data'
  | 'other';

export interface IntegrationCapabilities {
  synchronous: boolean;
  asynchronous: boolean;
  nestedPaths: boolean;
  multipleIssues: boolean;
  inputInference: boolean;
  outputInference: boolean;
  transformedOutput: boolean;
  focusedExecution: boolean;
  retainedState: boolean;
  raceSafety: boolean;
}

export interface IntegrationSourceExample {
  type: 'source';
  source: `${string}.ts`;
}

export interface IntegrationSandpackExample {
  type: 'sandpack';
  component: string;
  description: string;
  files: readonly string[];
  sourceExport: string;
}

export interface IntegrationDocumentation {
  install: string;
  purpose: string;
  example: IntegrationSourceExample | IntegrationSandpackExample;
}

export interface IntegrationRecord {
  id: string;
  title: string;
  category: IntegrationCategory;
  strategy: 'standard-schema' | 'dedicated-adapter' | 'native-plus-standard';
  workspace: `integrations/${string}`;
  websiteRoute: `/docs/integrations/${string}`;
  testedVersions: {
    vest: string;
    integration: string;
  };
  capabilities: IntegrationCapabilities;
  documentation: IntegrationDocumentation;
  upstream: {
    repository: string;
    targetFiles: readonly string[];
    contributionType: 'registry' | 'documentation' | 'example' | 'adapter';
    issue?: string;
    pullRequest?: string;
  };
  status: IntegrationStatus;
  lastVerified: string;
  limitations: readonly string[];
}
