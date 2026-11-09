// Minimal static server for the src folder: node serve.js [port]
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, 'src'), port = +process.argv[2] || 5180;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) return res.writeHead(403).end();
  fs.readFile(f, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data);
  });
}).listen(port, () => console.log('http://localhost:' + port));
