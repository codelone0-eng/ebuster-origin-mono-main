import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.REPORT_PORT || 8888;
const REPORTS_DIR = path.resolve(__dirname, '../reports');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url || '/index.html';
  
  // Remove query string
  filePath = filePath.split('?')[0];
  
  // Security: prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  
  const fullPath = path.join(REPORTS_DIR, filePath);

  // Check if file exists
  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try index.html in directory
      const indexPath = path.join(fullPath, 'index.html');
      fs.stat(indexPath, (indexErr, indexStats) => {
        if (indexErr || !indexStats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>404 Not Found</title>
              <style>
                body {
                  font-family: sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                }
                .container {
                  text-align: center;
                }
                h1 {
                  font-size: 4rem;
                  margin: 0;
                }
                p {
                  font-size: 1.5rem;
                }
                a {
                  color: white;
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>404</h1>
                <p>File not found</p>
                <p><a href="/">← Back to Dashboard</a></p>
              </div>
            </body>
            </html>
          `);
          return;
        }
        serveFile(indexPath, res);
      });
      return;
    }

    serveFile(fullPath, res);
  });
});

function serveFile(filePath: string, res: http.ServerResponse) {
  const mimeType = getMimeType(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`\n${'='.repeat(80)}`);
  console.log('🌐 Test Reports Server');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📁 Reports Directory: ${REPORTS_DIR}\n`);
  console.log('Available Reports:');
  console.log(`  • UI Admin:     http://localhost:${PORT}/ui-admin/html/index.html`);
  console.log(`  • UI LK:        http://localhost:${PORT}/ui-lk/html/index.html`);
  console.log(`  • API Admin:    http://localhost:${PORT}/api-admin/html/index.html`);
  console.log(`  • API LK:       http://localhost:${PORT}/api-lk/html/index.html`);
  console.log(`\n${'='.repeat(80)}`);
  console.log('Press Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
