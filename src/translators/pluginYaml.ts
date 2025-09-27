import fs from "fs-extra";
import YAML from "yaml";
import Ajv from "ajv";
import type { NormalizedPlugin } from "../types.js";

const SCHEMA = { type: "object", required: ["plugin","runtime","contract"] };
export async function loadPluginYaml(repoPath: string){ const s = await fs.readFile(repoPath + "/plugin.yaml","utf8"); return YAML.parse(s); }
export function normalizePluginYaml(yaml:any): NormalizedPlugin {
  const ajv = new Ajv(); const valid = ajv.validate(SCHEMA, yaml);
  if (!valid) throw new Error("plugin.yaml invalid");
  return {
    plugin: yaml.plugin,
    runtime: yaml.runtime,
    contract: yaml.contract,
    ui: yaml.ui || {},
    permissions: yaml.permissions || {},
    metadata: yaml.metadata || {}
  };
}
