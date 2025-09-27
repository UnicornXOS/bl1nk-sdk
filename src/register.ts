import fs from "fs-extra";
import path from "path";
import type { NormalizedPlugin, RegistryArtifact } from "./types.js";

export class Registry {
  dir: string;
  constructor(dir: string) { this.dir = dir; fs.ensureDirSync(dir); }

  async register(normalized: NormalizedPlugin, repoPath: string): Promise<RegistryArtifact> {
    const id = `${normalized.plugin.id}@${normalized.plugin.version}`;
    const out = path.join(this.dir, `${id}.json`);
    const artifact: RegistryArtifact = { normalized, repoPath, registeredAt: new Date().toISOString() };
    await fs.writeJson(out, artifact, { spaces: 2 });
    return artifact;
  }

  async getArtifact(id: string, version?: string): Promise<RegistryArtifact | null> {
    const pattern = version ? `${id}@${version}.json` : (await fs.readdir(this.dir)).find(f => f.startsWith(`${id}@`));
    if (!pattern) return null;
    return fs.readJson(path.join(this.dir, pattern));
  }

  async listArtifacts(): Promise<RegistryArtifact[]> {
    const files = await fs.readdir(this.dir);
    const items = await Promise.all(files.filter(f => f.endsWith(".json")).map(f => fs.readJson(path.join(this.dir, f))));
    return items;
  }
}