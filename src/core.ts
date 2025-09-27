// src/core.ts
import path from "path";
import fs from "fs-extra";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import crypto from "crypto";
import { Registry } from "./registry.js";
import { loadPluginYaml, normalizePluginYaml } from "./translators/pluginYaml.js";
import { generateToolList } from "./tool-list.js";
import { SessionManager } from "./session-manager.js";
import type {
  NormalizedPlugin,
  RegistryArtifact,
  ExecutionResult
} from "./types.js";

const exec = promisify(execCb);
const CORE_REGISTRY_DIR = path.resolve(process.cwd(), "core-registry");
const TOOL_LIST_FILE = path.resolve(process.cwd(), "tool-list.json");

const registry = new Registry(CORE_REGISTRY_DIR);
const sessions = new SessionManager();

async function computeHash(obj: any) {
  const s = JSON.stringify(obj);
  return crypto.createHash("sha256").update(s).digest("hex");
}

async function writeAudit(id: string, record: any) {
  const out = path.join(CORE_REGISTRY_DIR, `${id}.audit.log`);
  await fs.appendFile(out, `${new Date().toISOString()} ${JSON.stringify(record)}\n`);
}

export async function registerPlugin(repoPath: string): Promise<RegistryArtifact> {
  const yaml = await loadPluginYaml(repoPath);
  const normalized: NormalizedPlugin = normalizePluginYaml(yaml);
  const artifact = await registry.register(normalized, repoPath);

  const hash = await computeHash(artifact.normalized);
  artifact.hash = hash;
  await fs.writeJson(path.join(CORE_REGISTRY_DIR, `${artifact.normalized.plugin.id}@${artifact.normalized.plugin.version}.json`), artifact, { spaces: 2 });

  await generateToolList(await registry.listArtifacts(), TOOL_LIST_FILE);
  await writeAudit(artifact.normalized.plugin.id, { event: "register", repoPath, artifactHash: hash });

  if (artifact.normalized.runtime.build) {
    try {
      await buildPlugin(artifact.normalized.plugin.id, artifact.normalized.plugin.version);
      await writeAudit(artifact.normalized.plugin.id, { event: "build_auto_triggered", status: "ok" });
    } catch (e) {
      await writeAudit(artifact.normalized.plugin.id, { event: "build_auto_triggered", status: "error", error: String(e) });
    }
  }

  return artifact;
}

export async function buildPlugin(id: string, version?: string): Promise<RegistryArtifact> {
  const artifact = await registry.getArtifact(id, version);
  if (!artifact) throw new Error(`artifact not found ${id}${version ? "@" + version : ""}`);
  const runtime = artifact.normalized.runtime;
  if (!runtime.build) throw new Error("no build command declared in runtime.build");

  const repoPath = artifact.repoPath;
  const cmd = runtime.build;
  const opts = { cwd: repoPath, maxBuffer: 10 * 1024 * 1024, timeout: 1000 * 60 * 5 };

  await writeAudit(id, { event: "build_start", cmd, repoPath });
  try {
    const { stdout, stderr } = await exec(cmd, opts);
    const buildArtifactPath = path.join(CORE_REGISTRY_DIR, `${id}@${artifact.normalized.plugin.version}.build.log`);
    await fs.writeFile(buildArtifactPath, `STDOUT\n${stdout}\n\nSTDERR\n${stderr}`);
    await writeAudit(id, { event: "build_finish", success: true });
    await registry.register(artifact.normalized, repoPath);
    await generateToolList(await registry.listArtifacts(), TOOL_LIST_FILE);
    return artifact;
  } catch (e: any) {
    await writeAudit(id, { event: "build_finish", success: false, error: e.message });
    throw e;
  }
}

function safeJsonParse(s: string) {
  try { return JSON.parse(s); } catch { return undefined; }
}

async function runDirectInterpreter(runtime: NormalizedPlugin["runtime"], entry: string, repoPath: string, input: any, timeout = 30_000): Promise<ExecutionResult> {
  const runtimeType = runtime.type;
  let cmd: string;
  if (runtimeType === "nodejs") {
    cmd = `node ${entry}`;
  } else if (runtimeType === "python") {
    cmd = `python ${entry}`;
  } else {
    throw new Error(`unsupported direct interpreter ${runtimeType}`);
  }

  const opts = { cwd: repoPath, timeout, maxBuffer: 10 * 1024 * 1024 };
  const inputStr = typeof input === "string" ? input : JSON.stringify(input);

  await writeAudit(entry, { event: "exec_start", cmd, input: inputStr });

  try {
    const child = execCb(cmd, opts);
    const stdin = child.stdin;
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    if (stdin) stdin.write(inputStr) && stdin.end();

    if (child.stdout) child.stdout.on("data", d => stdoutChunks.push(Buffer.from(d)));
    if (child.stderr) child.stderr.on("data", d => stderrChunks.push(Buffer.from(d)));

    const exit = await new Promise<{ code: number; stdout: string; stderr: string }>((res, rej) => {
      child.on("error", rej);
      child.on("close", code => {
        res({ code: code ?? 0, stdout: Buffer.concat(stdoutChunks).toString("utf8"), stderr: Buffer.concat(stderrChunks).toString("utf8") });
      });
    });

    const parsed = safeJsonParse(exit.stdout);
    const result: ExecutionResult = {
      status: exit.code === 0 ? "ok" : "error",
      code: exit.code ?? 0,
      stdout: exit.stdout,
      stderr: exit.stderr,
      output: parsed,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString()
    };

    await writeAudit(entry, { event: "exec_finish", result: { status: result.status, code: result.code } });
    return result;
  } catch (e: any) {
    await writeAudit(entry, { event: "exec_error", error: e.message });
    return {
      status: "error",
      code: 1,
      stderr: String(e),
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString()
    };
  }
}

async function runDockerized(runtime: NormalizedPlugin["runtime"], repoPath: string, input: any): Promise<ExecutionResult> {
  const image = runtime.adapter?.image || null;
  if (!image) throw new Error("docker runtime requires runtime.adapter.image");
  const tmpIn = path.join(repoPath, ".bl1nk_input.json");
  await fs.writeJson(tmpIn, input);
  const cmd = `docker run --rm -v ${repoPath}:/app -w /app ${image} sh -c "cat .bl1nk_input.json | /app/${runtime.entrypoint}"`;
  try {
    const { stdout, stderr } = await exec(cmd, { cwd: repoPath, timeout: 60_000 });
    const parsed = safeJsonParse(stdout);
    return { status: "ok", code: 0, stdout, stderr, output: parsed, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() };
  } catch (e: any) {
    return { status: "error", code: 1, stderr: e.message, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() };
  } finally {
    await fs.remove(path.join(repoPath, ".bl1nk_input.json"));
  }
}

export async function executePlugin(id: string, input: any, options?: { sessionId?: string }): Promise<ExecutionResult> {
  const artifact = await registry.getArtifact(id);
  if (!artifact) throw new Error(`artifact not found ${id}`);
  const runtime = artifact.normalized.runtime;
  const repoPath = artifact.repoPath;

  if (artifact.normalized.permissions && artifact.normalized.permissions.filesystem === false) {
    // enforce permission gate
  }

  const sessionId = options?.sessionId || `s-${Date.now()}`;
  sessions.create(sessionId, { pluginId: id });

  await writeAudit(id, { event: "execute_request", sessionId, inputSummary: typeof input === "string" ? input : JSON.stringify(input).slice(0, 1024) });

  try {
    if (runtime.adapter && runtime.adapter.type === "http") {
      // adapter via HTTP
      const host = runtime.adapter.host!;
      const url = `http://${host}/invoke`;
      // minimal http call using node fetch if available
      // keep simple and synchronous failure handling
      const fetch = (await import("node-fetch")).default;
      const res = await fetch(url, { method: "POST", body: JSON.stringify({ input }), headers: { "content-type": "application/json" } });
      const body = await res.text();
      const parsed = safeJsonParse(body);
      const result: ExecutionResult = { status: res.ok ? "ok" : "error", code: res.status, stdout: body, output: parsed, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() };
      await writeAudit(id, { event: "execute_adapter_http", url, status: res.status });
      return result;
    }

    if (runtime.type === "docker") {
      return await runDockerized(runtime, repoPath, input);
    }

    // default: direct interpreter run
    const entry = path.resolve(repoPath, runtime.entrypoint);
    return await runDirectInterpreter(runtime, entry, repoPath, input);
  } finally {
    sessions.end(sessionId);
    await writeAudit(id, { event: "execute_complete", sessionId });
  }
}

export async function listRegisteredPlugins(): Promise<string[]> {
  const artifacts = await registry.listArtifacts();
  return artifacts.map(a => `${a.normalized.plugin.id}@${a.normalized.plugin.version}`);
}

// CLI wrapper for convenience when compiled to dist
if (process.argv[2] === "register" && process.argv[3]) {
  registerPlugin(process.argv[3]).then(a => console.log("registered", a.normalized.plugin.id)).catch(e => { console.error(e); process.exit(1); });
}