const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const OLLAMA = "http://localhost:11434";

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
};

function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = path.join(__dirname, urlPath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

function proxyChat(req, res) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const upstream = http.request(
      `${OLLAMA}/api/chat`,
      { method: "POST", headers: { "Content-Type": "application/json" } },
      (up) => {
        res.writeHead(up.statusCode, {
          "Content-Type": up.headers["content-type"] || "application/x-ndjson",
          "Cache-Control": "no-cache",
        });
        up.pipe(res);
      }
    );
    upstream.on("error", (err) => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err) }));
    });
    upstream.end(body);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return proxyChat(req, res);
  if (req.method === "GET" && req.url.startsWith("/api/models")) {
    return http
      .get(`${OLLAMA}/api/tags`, (up) => {
        let data = "";
        up.on("data", (c) => (data += c));
        up.on("end", () => {
          res.writeHead(up.statusCode, { "Content-Type": "application/json" });
          res.end(data);
        });
      })
      .on("error", () => {
        res.writeHead(502);
        res.end("{}");
      });
  }
  serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Kavach chat UI running at http://localhost:${PORT}`));
