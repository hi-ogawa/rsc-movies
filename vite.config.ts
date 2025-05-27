import rsc from "@hiogawa/vite-rsc/plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { reactRouter } from "./react-router-vite/plugin";
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
    rsc({
      entries: {
        browser: "./react-router-vite/entry.browser.tsx",
        ssr: "./react-router-vite/entry.ssr.tsx",
        rsc: "./react-router-vite/entry.rsc.tsx",
      },
    }),
    inspect(),
    vercelBuildPlugin(),
  ],
}) as any;

function vercelBuildPlugin(): Plugin {
  return {
    name: "cf-build",
    enforce: "post",
    apply: () => !!process.env.VC_BUILD,
    configEnvironment() {
      return {
        keepProcessEnv: false,
        resolve: {
          noExternal: true,
        },
      };
    },
    async generateBundle() {
      if (this.environment.name === "client") {
        const clientDir = this.environment.config.build.outDir;
        const adapterDir = path.join(clientDir, "..", "vercel");
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
        fs.cpSync(
          clientDir,
          path.join(adapterDir, "static"),
          {
            recursive: true,
          },
        );

        // function config
        fs.mkdirSync(path.join(adapterDir, "functions/index.func"), {
          recursive: true,
        });
        fs.writeFileSync(
          path.join(adapterDir, "functions/index.func/.vc-config.json"),
          JSON.stringify(
            {
              runtime: "nodejs20.x",
              handler: "index.mjs",
              launcherType: "Nodejs",
            },
            null,
            2,
          ),
        );
      }
    },
  };
}
