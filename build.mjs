import { build } from "esbuild";
await build({
  entryPoints: ["app.tsx"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: "dist/app.js",
  define: { "process.env.NODE_ENV": '"production"' },
});
