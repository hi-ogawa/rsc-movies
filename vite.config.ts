import { reactRouter } from "@hiogawa/vite-rsc-react-router/plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import inspect from "vite-plugin-inspect";
import path from "node:path";
import fs from "node:fs";

export default defineConfig({
  clearScreen: false,
  build: {
    minify: false,
  },
  plugins: [
    tailwindcss(),
    react(),
    reactRouter(),
    inspect(),
    vercelBuildPlugin(),
  ],
}) as any;

function vercelBuildPlugin(): Plugin {
  return {
    name: "vc-build",
    enforce: "post",
    apply: () => !!process.env.VERCEL,
    configEnvironment() {
      return {
        resolve: {
          noExternal: true,
          external: ["better-sqlite3"],
        },
        define: {
          "process.env.NODE_ENV": `"production"`,
        },
      };
    },
    async buildApp() {
      await buildVercel();
    },
  };
}

async function buildVercel() {
  const adapterDir = "./.vercel/output";
  const clientDir = "./dist/client";
  fs.rmSync(adapterDir, { recursive: true, force: true });
  fs.mkdirSync(adapterDir, { recursive: true });
  fs.writeFileSync(
    path.join(adapterDir, "config.json"),
    JSON.stringify(
      {
        version: 3,
        trailingSlash: false,
        routes: [
          {
            src: "^/assets/(.*)$",
            headers: {
              "cache-control": "public, immutable, max-age=31536000",
            },
          },
          {
            handle: "filesystem",
          },
          {
            src: ".*",
            dest: "/",
          },
        ],
        overrides: {},
      },
      null,
      2,
    ),
  );

  // static
  fs.mkdirSync(path.join(adapterDir, "static"), { recursive: true });
  fs.cpSync(clientDir, path.join(adapterDir, "static"), {
    recursive: true,
  });

  // function config
  const functionDir = path.join(adapterDir, "functions/index.func");
  fs.mkdirSync(functionDir, {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(functionDir, ".vc-config.json"),
    JSON.stringify(
      {
        runtime: "nodejs22.x",
        handler: "dist/rsc/__vercel.js",
        launcherType: "Nodejs",
      },
      null,
      2,
    ),
  );

  // copy server entry and dependencies
  const { nodeFileTrace } = await import("@vercel/nft");
  const serverEntry = path.join(clientDir, "../rsc/__vercel.js");
  fs.writeFileSync(
    serverEntry,
    `\
import { createRequestListener } from "@mjackson/node-fetch-server";
import handler from "./index.js";
export default createRequestListener(handler);
`,
  );
  const result = await nodeFileTrace([serverEntry]);
  for (const file of result.fileList) {
    const dest = path.join(functionDir, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    // preserve pnpm node_modules releative symlinks
    const stats = fs.lstatSync(file);
    if (stats.isSymbolicLink()) {
      const link = fs.readlinkSync(file);
      fs.symlinkSync(link, dest);
    } else {
      fs.copyFileSync(file, dest);
    }
  }
}
