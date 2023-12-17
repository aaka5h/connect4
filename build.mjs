#!/usr/bin/env node

import { sassPlugin } from "esbuild-sass-plugin";
import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  //   index.js --bundle --outfile=build/index.js
  entryPoints: ["index.js"],
  outdir: "build",
  //    outfile: 'index.js',
  bundle: true,
  plugins: [sassPlugin()],
});

await ctx.watch();
