import json
import mimetypes
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from questions import QUESTION_BANK


APP_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = APP_DIR / "templates"
STATIC_DIR = APP_DIR / "static"


class AppHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path

        if path in {"/", "/index.html"}:
            self.serve_file(TEMPLATES_DIR / "index.html", "text/html; charset=utf-8")
            return

        if path == "/api/questions":
            payload = json.dumps(QUESTION_BANK).encode("utf-8")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        if path.startswith("/static/"):
            requested = path.removeprefix("/static/")
            safe_path = (STATIC_DIR / requested).resolve()
            if safe_path.is_file() and STATIC_DIR in safe_path.parents:
                content_type = mimetypes.guess_type(str(safe_path))[0] or "application/octet-stream"
                self.serve_file(safe_path, content_type)
                return

        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def log_message(self, format, *args):
        return

    def serve_file(self, file_path: Path, content_type: str):
        payload = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8099), AppHandler)
    server.serve_forever()
