import { loadPluginYaml, normalizePluginYaml } from "./translators/pluginYaml.js";
import { Registry } from "./registry.js";

const registry = new Registry("./core-registry");

export async function registerPlugin(repoPath: string) {
  const yaml = await loadPluginYaml(repoPath);
  const normalized = normalizePluginYaml(yaml);
  return registry.register(normalized, repoPath);
}

if (process.argv[2] === "register" && process.argv[3]) {
  registerPlugin(process.argv[3]).then(r => console.log("registered", r.normalized.plugin.id)).catch(e => { console.error(e); process.exit(1); });
}