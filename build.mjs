#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).argv;

import { sassPlugin } from "esbuild-sass-plugin";
import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["index.js"],
  outdir: "build",
  bundle: true,
  plugins: [sassPlugin()],
});

if (argv.watch) {
  console.log('watching build...');
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
