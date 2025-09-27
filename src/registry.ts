import fs from 'fs/promises';
import path from 'path';
import { NormalizedPlugin, RegistryArtifact } from './types';

const REGISTRY_DIR = './core-registry';

export async function ensureRegistryDir(): Promise<void> {
  try {
    await fs.access(REGISTRY_DIR);
  } catch {
    await fs.mkdir(REGISTRY_DIR, { recursive: true });
  }
}

export async function register(normalized: NormalizedPlugin, repoPath: string): Promise<void> {
  await ensureRegistryDir();
  
  const artifact: RegistryArtifact = {
    ...normalized,
    verified: false,
  };

  const filename = `${normalized.id}@${normalized.version}.json`;
  const filepath = path.join(REGISTRY_DIR, filename);
  
  // Atomic write
  const tempPath = `${filepath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(artifact, null, 2));
  await fs.rename(tempPath, filepath);
}

export async function getArtifact(id: string, version: string): Promise<RegistryArtifact | null> {
  try {
    const filename = `${id}@${version}.json`;
    const filepath = path.join(REGISTRY_DIR, filename);
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function listArtifacts(): Promise<RegistryArtifact[]> {
  await ensureRegistryDir();
  const files = await fs.readdir(REGISTRY_DIR);
  const artifacts: RegistryArtifact[] = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const content = await fs.readFile(path.join(REGISTRY_DIR, file), 'utf-8');
        artifacts.push(JSON.parse(content));
      } catch (error) {
        console.warn(`Failed to load artifact ${file}:`, error);
      }
    }
  }
  
  return artifacts;
}

export async function persistRendered(
  rendered: string, 
  meta: { tool_id: string; tool_version: string; props: any }
): Promise<void> {
  await ensureRegistryDir();
  
  const artifact = await getArtifact(meta.tool_id, meta.tool_version);
  if (!artifact) {
    throw new Error(`Artifact ${meta.tool_id}@${meta.tool_version} not found`);
  }
  
  artifact.renderedInvocation = rendered;
  artifact.propsSnapshot = meta.props;
  artifact.verified = false;
  
  const filename = `${meta.tool_id}@${meta.tool_version}.json`;
  const filepath = path.join(REGISTRY_DIR, filename);
  
  await fs.writeFile(filepath, JSON.stringify(artifact, null, 2));
}
