// Build dla Cloudflare Workers Builds (pole „Build command”).
//  - gałąź main  -> build produkcyjny ze strażnikiem placeholderów (nie opublikuje niegotowej strony),
//  - inne gałęzie -> zwykły build preview (z noindex, patrz src/layouts/Base.astro).
import { execSync } from "node:child_process";

const branch = process.env.WORKERS_CI_BRANCH ?? "";
const command = branch === "main" ? "npm run build:prod" : "npm run build";
console.log(`Gałąź: ${branch || "(lokalnie)"} -> ${command}`);
execSync(command, { stdio: "inherit" });
