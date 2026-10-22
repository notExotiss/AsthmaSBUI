import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4321/#dashboard", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(() => {
  [...document.querySelectorAll(".bottom-navigation button")].find(
    (b) => b.textContent.trim() === "Community",
  )?.click();
});
await new Promise((r) => setTimeout(r, 800));
const panel = await page.$(".page-stack .panel");
if (panel) await panel.screenshot({ path: "s-map-dark.png" });
// select a zone
await page.evaluate(() => document.querySelector(".map-zone")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await new Promise((r) => setTimeout(r, 400));
const panel2 = await page.$(".page-stack .panel");
if (panel2) await panel2.screenshot({ path: "s-map-selected.png" });
// light
await page.click(".app-header .theme-toggle").catch(() => {});
await new Promise((r) => setTimeout(r, 400));
const panel3 = await page.$(".page-stack .panel");
if (panel3) await panel3.screenshot({ path: "s-map-light.png" });
console.log("errors:", errors.length ? errors : "none");
await browser.close();
