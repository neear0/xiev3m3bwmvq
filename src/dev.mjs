// Local run of the real Worker (form endpoint included) with preview data.
//
//   npm run dev
//
// AQUA_PREVIEW is set only for this child process, so the build that
// `wrangler deploy` runs later never inherits it and still refuses to ship
// placeholders.

import { spawn } from "node:child_process";

const env = { ...process.env, AQUA_PREVIEW: "1" };
const child = spawn("npx", ["wrangler", "dev"], { stdio: "inherit", env, shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
