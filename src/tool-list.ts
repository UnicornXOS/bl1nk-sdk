import fs from "fs-extra";
export async function generateToolList(artifacts: any[], out = "tool-list.json") {
  const tools = artifacts.map(a => ({ id: a.normalized.plugin.id, version: a.normalized.plugin.version, runtime: a.normalized.runtime }));
  await fs.writeJson(out, { tools, generatedAt: new Date().toISOString() }, { spaces: 2 });
}
export async function readToolList(p = "tool-list.json"){ return fs.pathExists(p) ? fs.readJson(p) : null; }
