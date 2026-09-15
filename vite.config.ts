import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

// Writes <outDir>/version.txt so you can confirm which build is live by hitting
// /version.txt on the server. The build number is the git commit count:
// monotonic, and needs no state file to increment. Copied from admin.naxits.
const versionFile = (): Plugin => {
  const git = (cmd: string) =>
    execSync(`git ${cmd}`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();

  let outDir = "dist";

  return {
    name: "version-file",
    apply: "build",

    configResolved(config) {
      outDir = config.build.outDir;
    },

    closeBundle() {
      let build = "unknown";
      let commit = "unknown";
      let branch = "unknown";

      try {
        build = git("rev-list --count HEAD");
        commit = git("rev-parse --short HEAD");
        branch = git("rev-parse --abbrev-ref HEAD");
      } catch {
        this.warn("git unavailable - writing version.txt without commit info");
      }

      const contents = [
        `build: ${build}`,
        `commit: ${commit}`,
        `branch: ${branch}`,
        `date: ${new Date().toISOString()}`,
        "",
      ].join("\n");

      fs.writeFileSync(path.resolve(__dirname, outDir, "version.txt"), contents);
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    // 8082: admin.naxits uses 8081 and naxits/imravithedev use their own ports,
    // so this runs alongside them without a collision.
    port: 8082,
  },
  plugins: [react(), versionFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
