import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, ".output", "public");

const serverModule = await import("./.output/server/index.mjs");
const appHandler = serverModule.default?.fetch || serverModule.fetch;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    // Check for static asset in .output/public
    const sanitizedPath = path.normalize(url.pathname).replace(/^(\.\.[\/\\])+/, "");
    const filePath = path.join(publicDir, sanitizedPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      if (ext !== ".html") {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Forward to SSR handler
    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (Array.isArray(val)) {
        val.forEach((v) => headers.append(key, v));
      } else if (val !== undefined) {
        headers.set(key, val);
      }
    }

    const webRequest = new Request(url.href, {
      method: req.method || "GET",
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
      duplex: req.method !== "GET" && req.method !== "HEAD" ? "half" : undefined,
    });

    const webResponse = await appHandler(webRequest, process.env, { waitUntil: () => {} });

    res.statusCode = webResponse.status;
    webResponse.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    if (webResponse.body) {
      const buffer = Buffer.from(await webResponse.arrayBuffer());
      res.end(buffer);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Request error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Internal Server Error");
    }
  }
});

server.listen(port, host, () => {
  console.log(`EngineerOS production server running on http://${host}:${port}`);
});
