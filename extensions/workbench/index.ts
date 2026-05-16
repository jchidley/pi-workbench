import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { spawn } from "node:child_process";

function run(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["/home/jack/github/pi-workbench/bin/pi-workbench.js", ...args], { cwd });
    let out = "";
    child.stdout.on("data", d => out += d.toString());
    child.stderr.on("data", d => out += d.toString());
    child.on("close", code => code === 0 ? resolve(out.trim()) : reject(new Error(out.trim() || `exit ${code}`)));
  });
}

export default function(pi: ExtensionAPI) {
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
