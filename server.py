#!/usr/bin/env python3
"""Мини-сервер Shadow Ascension: Cache-Control: no-store для HTML/JSON,
долгий кэш для версионированных (?v=) скриптов и картинок.
Запуск: python3 server.py [порт]"""
import sys, os, mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        ct = self.headers.get('Content-Type', '') if hasattr(self, 'headers') and self.headers else ''
        path = self.path.split('?')[0]
        ext = os.path.splitext(path)[1].lower()
        if ext in ('.html', '.json') or '?' in self.path and ext == '.js':
            self.send_header('Cache-Control', 'no-store, must-revalidate')
        elif ext in ('.js', '.png', '.jpg', '.svg', '.woff2'):
            self.send_header('Cache-Control', 'public, max-age=604800')  # ?v= версионировано
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def guess_type(self, path):
        t = super().guess_type(path)
        if path.endswith('.js'): return 'text/javascript; charset=utf-8'
        return t

if __name__ == '__main__':
    print(f'Shadow Ascension server: http://0.0.0.0:{PORT} (no-store для html/json)')
    HTTPServer(('0.0.0.0', PORT), NoCacheHandler).serve_forever()
