import http.server
import socketserver
import os
import json
import threading
import time
import datetime
import urllib.parse
from sync_engine import run_sync, STATUS_FILE, log

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Auto sync interval in hours (e.g. sync every 6 hours automatically)
AUTO_SYNC_INTERVAL_HOURS = 6

sync_state = {
    'is_syncing': False
}
sync_lock = threading.Lock()

def background_sync_worker():
    with sync_lock:
        if sync_state['is_syncing']:
            return
        sync_state['is_syncing'] = True
    try:
        run_sync()
    finally:
        with sync_lock:
            sync_state['is_syncing'] = False

def scheduled_sync_loop():
    """Background daemon that triggers sync every AUTO_SYNC_INTERVAL_HOURS hours."""
    log(f"Background auto-sync daemon aktif. Interval: setiap {AUTO_SYNC_INTERVAL_HOURS} jam.")
    while True:
        time.sleep(AUTO_SYNC_INTERVAL_HOURS * 3600)
        log("Memicu auto-sinkronisasi terjadwal...")
        background_sync_worker()

class SyncHttpHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # API Status Endpoint
        if parsed.path == '/api/sync/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()

            status_data = {}
            if os.path.exists(STATUS_FILE):
                try:
                    with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                        status_data = json.load(f)
                except Exception:
                    pass

            with sync_lock:
                status_data['is_syncing'] = sync_state['is_syncing']
                status_data['auto_interval_hours'] = AUTO_SYNC_INTERVAL_HOURS

            self.wfile.write(json.dumps(status_data).encode('utf-8'))
            return

        # API Trigger Sync Endpoint
        elif parsed.path == '/api/sync':
            triggered = False
            with sync_lock:
                if not sync_state['is_syncing']:
                    triggered = True
                    threading.Thread(target=background_sync_worker, daemon=True).start()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()

            resp = {
                'triggered': triggered,
                'message': 'Sinkronisasi dimulai di background.' if triggered else 'Sinkronisasi sedang berjalan, mohon tunggu.'
            }
            self.wfile.write(json.dumps(resp).encode('utf-8'))
            return

        # Otherwise serve normal files
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/sync':
            self.do_GET()
        else:
            self.send_error(404, "Not Found")

def start_server():
    daemon_thread = threading.Thread(target=scheduled_sync_loop, daemon=True)
    daemon_thread.start()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SyncHttpHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"\n=======================================================")
        print(f"🚀 Cipta Group Portal + Auto-Sync Server aktif di: {url}")
        print(f"🔄 Auto-Sync Linktree: Setiap {AUTO_SYNC_INTERVAL_HOURS} jam & on-demand (/api/sync)")
        print(f"📂 Direktori: {DIRECTORY}")
        print(f"=======================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")

if __name__ == "__main__":
    start_server()
