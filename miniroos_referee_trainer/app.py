from flask import Flask, render_template

from questions import QUESTION_BANK


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
    app.run(host="0.0.0.0", port=8099)
