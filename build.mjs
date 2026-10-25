import { build } from "esbuild";
import { cp, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const values = {};
for (const file of [".env", ".env.local"]) {
  try {
    const contents = await readFile(file, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match && !match[1].startsWith("#")) values[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch {}
}
const env = (name) => JSON.stringify(process.env[name] || values[name] || "");
const airflowUrl = env("VITE_AIRFLOW_URL");
const functionsSource = await readFile("functions/index.js", "utf8");
const backendPushKey = functionsSource.match(/const webPushVapidPublicKey = "([^"]+)";/)?.[1] || "";
const pushPublicKey = env("VITE_WEB_PUSH_PUBLIC_KEY") === '""'
  ? JSON.stringify(backendPushKey)
  : env("VITE_WEB_PUSH_PUBLIC_KEY");
const html = await readFile("index.html", "utf8");
await writeFile("dist/index.html", html.replaceAll("./dist/app.css", "./app.css").replaceAll("./dist/app.js", "./app.js"), "utf8");
await mkdir("dist/notification", { recursive: true });
await writeFile("dist/notification/index.html", html.replaceAll("./fonts.css", "../fonts.css").replaceAll("./dist/app.css", "../app.css").replaceAll("./dist/app.js", "../app.js"), "utf8");
await copyFile("fonts.css", "dist/fonts.css");
await cp("fonts", "dist/fonts", { recursive: true, force: true });
await copyFile("manifest.webmanifest", "dist/manifest.webmanifest");
await copyFile("service-worker.js", "dist/service-worker.js");
await cp("icons", "dist/icons", { recursive: true, force: true });
await build({
  entryPoints: ["app.tsx"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: "dist/app.js",
  define: {
    "process.env.NODE_ENV": '"production"',
    __FIREBASE_API_KEY__: env("VITE_FIREBASE_API_KEY"),
    __FIREBASE_AUTH_DOMAIN__: env("VITE_FIREBASE_AUTH_DOMAIN"),
    __FIREBASE_PROJECT_ID__: env("VITE_FIREBASE_PROJECT_ID"),
    __FIREBASE_STORAGE_BUCKET__: env("VITE_FIREBASE_STORAGE_BUCKET"),
    __FIREBASE_MESSAGING_SENDER_ID__: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    __FIREBASE_APP_ID__: env("VITE_FIREBASE_APP_ID"),
    __WEB_PUSH_PUBLIC_KEY__: pushPublicKey,
    __GOOGLE_MAPS_API_KEY__: env("VITE_GOOGLE_MAPS_API_KEY"),
    __AIRFLOW_URL__: airflowUrl === '""' ? JSON.stringify("http://192.168.4.36/airflow") : airflowUrl,
  },
});
try {
  await copyFile("output/pdf/sample-care-plan.pdf", "dist/sample-care-plan.pdf");
} catch {}
