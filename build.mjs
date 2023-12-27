#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).argv;

import { sassPlugin } from "esbuild-sass-plugin";
import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";

const ctx = await esbuild.context({
  entryPoints: ["src/index.js"],
  outdir: "build",
  bundle: true,
  plugins: [
    sassPlugin(),
    copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
      resolveFrom: "cwd",
      assets: {
        from: "./src/public/*",
        to: "./build",
      },
    }),
  ],
});

if (argv.watch) {
  console.log("watching build...");
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
