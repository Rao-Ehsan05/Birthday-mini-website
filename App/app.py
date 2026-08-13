
from flask import Flask, render_template, request, jsonify, send_from_directory
from pathlib import Path
from werkzeug.utils import secure_filename
import uuid
import json

app = Flask(__name__)
BASE = Path(__file__).resolve().parent
UPLOADS = BASE / "static" / "uploads"
UPLOADS.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGES = {"png", "jpg", "jpeg", "webp", "gif"}
ALLOWED_VIDEOS = {"mp4", "webm", "mov", "m4v"}

def allowed(filename, extensions):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in extensions

@app.get("/")
def index():
    return render_template("index.html")

@app.post("/api/create")
def create_birthday():
    name = request.form.get("name", "").strip()
    dob = request.form.get("dob", "").strip()
    birthday_number = request.form.get("birthday_number", "").strip()

    if not name:
        return jsonify(error="Please enter a name."), 400

    media = []
    for file in request.files.getlist("media"):
        if not file or not file.filename:
            continue
        filename = secure_filename(file.filename)
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_IMAGES | ALLOWED_VIDEOS:
            continue
        saved = f"{uuid.uuid4().hex}.{ext}"
        file.save(UPLOADS / saved)
        media.append({
            "url": f"/static/uploads/{saved}",
            "type": "video" if ext in ALLOWED_VIDEOS else "image"
        })

    data = {
        "name": name,
        "dob": dob,
        "birthday_number": birthday_number,
        "media": media
    }
    return jsonify(data=data)

@app.post("/api/save")
def save_birthday():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "birthday")).strip() or "birthday"
    safe = secure_filename(name)[:40] or "birthday"
    filename = f"{safe}_birthday.json"
    out = BASE / "saved_birthday_files"
    out.mkdir(exist_ok=True)
    (out / filename).write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return jsonify(filename=filename)

if __name__ == "__main__":
    app.run(debug=True)
