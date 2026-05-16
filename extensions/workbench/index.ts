import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function run(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["/home/jack/github/pi-workbench/bin/pi-workbench.js", ...args], { cwd });
    let out = "";
    child.stdout.on("data", d => out += d.toString());
    child.stderr.on("data", d => out += d.toString());
    child.on("close", code => code === 0 ? resolve(out.trim()) : reject(new Error(out.trim() || `exit ${code}`)));
  });
}

function runShell(command: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", ["-lc", command], { cwd });
    let out = "";
    child.stdout.on("data", d => out += d.toString());
    child.stderr.on("data", d => out += d.toString());
    child.on("close", code => code === 0 ? resolve(out.trim()) : reject(new Error(out.trim() || `exit ${code}`)));
  });
}

function isWorkbenchRepo(cwd: string): boolean {
  return fs.existsSync(path.join(cwd, ".workbench", "config.toml"));
}

async function runGuard(cwd: string): Promise<string> {
  const checkScript = path.join(cwd, "scripts", "check.sh");
  if (fs.existsSync(checkScript)) return runShell("./scripts/check.sh", cwd);
  return run(["check"], cwd);
}

export default function(pi: ExtensionAPI) {
  let guardRunning = false;
  let guardFeedbackInFlight = false;

  pi.on("session_start", async (_event, ctx) => {
    const cwd = process.cwd();
    if (!isWorkbenchRepo(cwd)) return;
    if (process.env.PI_WORKBENCH_GUARD === "0") {
      if (ctx.hasUI) ctx.ui.setStatus("workbench", "guard disabled");
      return;
    }
    if (ctx.hasUI) {
      ctx.ui.setStatus("workbench", "guard active");
      ctx.ui.notify("pi-workbench guard active: ./scripts/check.sh will run after each agent prompt", "info");
    }
  });

  pi.on("agent_end", async (_event, ctx) => {
    const cwd = process.cwd();
    if (!isWorkbenchRepo(cwd)) return;
    if (process.env.PI_WORKBENCH_GUARD === "0") return;
    if (guardRunning) return;

    guardRunning = true;
    try {
      const text = await runGuard(cwd);
      guardFeedbackInFlight = false;
      if (ctx.hasUI) ctx.ui.setStatus("workbench", "guard passed");
      pi.sendMessage({
        customType: "workbench-check",
        content: `pi-workbench guard passed.\n\n${text}`,
        display: false,
      }, { triggerTurn: false });
    } catch (err: any) {
      const message = String(err?.message || err);
      if (ctx.hasUI) ctx.ui.setStatus("workbench", "guard failed");
      if (ctx.hasUI) ctx.ui.notify("pi-workbench guard failed; sending failure back to agent", "error");
      if (!guardFeedbackInFlight) {
        guardFeedbackInFlight = true;
        pi.sendUserMessage(`pi-workbench guard failed. You must fix this before declaring the task complete.\n\n\`\`\`\n${message}\n\`\`\``, { deliverAs: "followUp" });
      }
    } finally {
      guardRunning = false;
    }
  });

  pi.registerCommand("workbench", {
    description: "Run pi-workbench commands: status, check, init, next",
    handler: async (args, ctx) => {
      const parts = args.trim() ? args.trim().split(/\s+/) : ["status"];
      try {
        const text = await run(parts, process.cwd());
        ctx.ui.notify(text || "done", "info");
      } catch (err: any) {
        ctx.ui.notify(err.message, "error");
      }
    }
  });

  pi.registerTool({
    name: "workbench_check",
    label: "Workbench Check",
    description: "Run pi-workbench check in the current repository.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      const text = await run(["check"], process.cwd());
      return { content: [{ type: "text", text }], details: {} };
    }
  });

  pi.registerTool({
    name: "workbench_status",
    label: "Workbench Status",
    description: "Show local pi-workbench task queue status.",
    parameters: Type.Object({}),
    async execute() {
      const text = await run(["status"], process.cwd());
      return { content: [{ type: "text", text }], details: {} };
    }
  });

  pi.registerTool({
    name: "workbench_task_next",
    label: "Workbench Next Task",
    description: "Return the next inbox task path.",
    parameters: Type.Object({}),
    async execute() {
      const text = await run(["task", "next"], process.cwd());
      return { content: [{ type: "text", text }], details: {} };
    }
  });
}
