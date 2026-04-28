import json
import os

from flask import Flask, render_template

from questions import QUESTION_BANK


def get_port():
    """Read the port from the Home Assistant add-on options, defaulting to 8099."""
    options_path = "/data/options.json"
    if os.path.exists(options_path):
        try:
            with open(options_path) as f:
                return int(json.load(f).get("port", 8099))
        except Exception:
            pass
    return 8099


class IngressFix:
    """Middleware to handle Home Assistant ingress path prefix.

    HA ingress proxies requests through a dynamic token-based path and sets
    the X-Ingress-Path header so the add-on knows its prefix. Without this,
    Flask generates static-file URLs without the prefix and the page breaks.
    """

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        ingress_path = environ.get("HTTP_X_INGRESS_PATH", "")
        if ingress_path:
            environ["SCRIPT_NAME"] = ingress_path
            path_info = environ.get("PATH_INFO", "")
            if path_info.startswith(ingress_path):
                environ["PATH_INFO"] = path_info[len(ingress_path):]
        return self.app(environ, start_response)


app = Flask(__name__)
app.wsgi_app = IngressFix(app.wsgi_app)


@app.route("/")
def index():
    return render_template("index.html", question_bank=QUESTION_BANK)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=get_port())
