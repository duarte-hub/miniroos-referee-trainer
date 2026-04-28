import json
import os
from datetime import datetime

from flask import Flask, jsonify, render_template, request

from questions import QUESTION_BANK

RESULTS_PATH = "/data/results.json"


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


def load_results():
    try:
        if os.path.exists(RESULTS_PATH):
            with open(RESULTS_PATH) as f:
                return json.load(f)
    except Exception:
        pass
    return []


def save_results(results):
    with open(RESULTS_PATH, "w") as f:
        json.dump(results, f, indent=2)


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


@app.route("/submit-result", methods=["POST"])
def submit_result():
    data = request.get_json(silent=True) or {}
    results = load_results()
    results.append({
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "age_group": data.get("age_group", "Unknown"),
        "score": data.get("score", 0),
        "total": data.get("total", 0),
        "percent": data.get("percent", 0),
    })
    save_results(results)
    return jsonify({"ok": True})


@app.route("/admin")
def admin():
    results = list(reversed(load_results()))
    return render_template("admin.html", results=results)


@app.route("/admin/clear", methods=["POST"])
def clear_results():
    save_results([])
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=get_port())
