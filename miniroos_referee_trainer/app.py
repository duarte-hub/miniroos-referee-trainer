from flask import Flask, render_template

from questions import QUESTION_BANK


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html", question_bank=QUESTION_BANK)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8099)
