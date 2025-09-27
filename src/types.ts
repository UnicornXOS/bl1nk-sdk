export type RuntimeType = "nodejs" | "python" | "docker" | "binary" | "http";

export interface RuntimeSpec {
  type: RuntimeType;
  language?: string;
  entrypoint: string;
  source?: string | null;
  build?: string | null;
  adapter?: any | null;
}

export interface PluginMetadata { id: string; name: string; version: string; author?: string; }

export interface NormalizedPlugin {
  plugin: PluginMetadata;
  runtime: RuntimeSpec;
  contract: any;
  ui?: any;
  permissions?: Record<string, boolean>;
  metadata?: any;
}

export interface RegistryArtifact {
  normalized: NormalizedPlugin;
  repoPath: string;
  registeredAt: string;
  signer?: string;
  hash?: string;
}

export interface ExecutionResult {
  status: "ok" | "error";
  code: number;
  stdout?: string;
  stderr?: string;
  output?: any;
  startedAt: string;
  finishedAt: string;
}