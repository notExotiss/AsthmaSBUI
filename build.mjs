import { build } from "esbuild";
await build({
  entryPoints: ["health-ui/app.tsx"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: "health-ui/dist/app.js",
  define: { "process.env.NODE_ENV": '"production"' },
});
