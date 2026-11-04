const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { runSync } = require('./sync');

const PORT = process.env.PORT || 8000;
const BASE_DIR = __dirname;
const STATUS_FILE = path.join(BASE_DIR, 'sync_status.json');
const AUTO_SYNC_INTERVAL_HOURS = 6;

let isSyncing = false;

// Background Auto-Sync Worker
async function triggerSync() {
  if (isSyncing) return false;
  isSyncing = true;
  console.log('[Node.js Server] Memulai auto-sinkronisasi Linktree di background...');
  try {
    await runSync();
  } catch (err) {
    console.error('[Node.js Server] Error saat sinkronisasi:', err);
  } finally {
    isSyncing = false;
  }
  return true;
}

// Scheduled Cron-like loop every 6 hours
function startScheduledSync() {
  console.log(`[Node.js Server] Auto-sync daemon aktif. Interval: setiap ${AUTO_SYNC_INTERVAL_HOURS} jam.`);
  setInterval(() => {
    console.log('[Node.js Server] Menjalankan sinkronisasi terjadwal...');
    triggerSync();
  }, AUTO_SYNC_INTERVAL_HOURS * 3600 * 1000);
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. API Status Endpoint
  if (pathname === '/api/sync/status') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    let statusData = {};
    if (fs.existsSync(STATUS_FILE)) {
      try {
        statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
      } catch (e) {}
    }

    statusData.is_syncing = isSyncing;
    statusData.auto_interval_hours = AUTO_SYNC_INTERVAL_HOURS;
    statusData.server = 'Node.js v' + process.versions.node;

    res.end(JSON.stringify(statusData));
    return;
  }

  // 2. API Trigger Sync Endpoint
  if (pathname === '/api/sync') {
    const triggered = !isSyncing;
    if (triggered) {
      // Run async in background without blocking response
      setImmediate(() => {
        triggerSync();
      });
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    res.end(JSON.stringify({
      triggered,
      message: triggered 
        ? 'Sinkronisasi Node.js dimulai di background.' 
        : 'Sinkronisasi sedang berjalan, mohon tunggu.'
    }));
    return;
  }

  // 3. Static Files Serving
  let filePath = path.join(BASE_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check to avoid directory traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 File Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log('\n=======================================================');
  console.log(`🚀 Cipta Group Portal [Node.js Engine] aktif di: http://localhost:${PORT}`);
  console.log(`🔄 Auto-Sync Linktree: Setiap ${AUTO_SYNC_INTERVAL_HOURS} jam & on-demand (/api/sync)`);
  console.log(`⚡ Node.js Version: ${process.version}`);
  console.log(`📂 Direktori: ${BASE_DIR}`);
  console.log('=======================================================\n');
  startScheduledSync();
});

// Graceful error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[X] Port ${PORT} sedang dipakai. Mohon hentikan proses yang memakai port ${PORT}.`);
  } else {
    console.error('[X] Server error:', err);
  }
});
