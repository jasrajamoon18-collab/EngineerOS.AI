import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputPublic = path.join(rootDir, ".output", "public");
const outputServer = path.join(rootDir, ".output", "server", "index.mjs");
const distDir = path.join(rootDir, "dist");

try {
  // 1. Ensure dist directory exists and copy .output/public
  fs.mkdirSync(distDir, { recursive: true });
  if (fs.existsSync(outputPublic)) {
    fs.cpSync(outputPublic, distDir, { recursive: true });
  }

  // 2. Render root HTML from SSR engine to satisfy static hosting scanners
  if (fs.existsSync(outputServer)) {
    const serverModule = await import(outputServer);
    const handler = serverModule.default?.fetch || serverModule.fetch;
    if (typeof handler === "function") {
      const response = await handler(new Request("http://localhost/"), process.env, {
        waitUntil: () => {},
      });
      if (response && response.status === 200) {
        const html = await response.text();
        fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");
        // Also place index.html at root for buildpack scanners
        fs.writeFileSync(path.join(rootDir, "index.html"), html, "utf-8");
        console.log(
          `[postbuild] Generated dist/index.html & root index.html (${html.length} bytes)`,
        );
      }
    }
  }
} catch (error) {
  console.warn("[postbuild] Non-fatal postbuild warning:", error);
}
