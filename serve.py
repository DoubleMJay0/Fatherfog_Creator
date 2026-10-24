#!/usr/bin/env python3
"""Lokaler Testserver ohne Browser-Cache: python3 serve.py  →  http://localhost:8000"""
import http.server, socketserver, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('', 8000), NoCache) as httpd:
    print('Fatherfog läuft auf http://localhost:8000  (Strg+C beendet)')
    httpd.serve_forever()
