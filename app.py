import sqlite3
import csv
import io
import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, Response

app = Flask(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "events.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            event_name TEXT NOT NULL,
            event_label TEXT,
            page TEXT,
            ts TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


# Eventos que esperamos recibir desde el frontend.
# Si agregas un nuevo botón con data-track="algo" en el HTML, no necesitas
# tocar este archivo: el evento se registra solo.

@app.route("/")
def landing():
    return render_template("landing.html")


@app.route("/usuario")
def usuario():
    return render_template("usuario.html")


@app.route("/experto")
def experto():
    return render_template("experto.html")


@app.route("/api/track", methods=["POST"])
def track():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id", "unknown")
    event_name = data.get("event_name", "unknown")
    event_label = data.get("event_label", "")
    page = data.get("page", "/")
    ts = datetime.utcnow().isoformat()

    conn = get_db()
    conn.execute(
        "INSERT INTO events (session_id, event_name, event_label, page, ts) VALUES (?, ?, ?, ?, ?)",
        (session_id, event_name, event_label, page, ts),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/dashboard")
def dashboard():
    conn = get_db()

    total_pageviews = conn.execute(
        "SELECT COUNT(DISTINCT session_id) c FROM events WHERE event_name = 'pageview'"
    ).fetchone()["c"]

    rows = conn.execute(
        """
        SELECT event_name, COUNT(*) total, COUNT(DISTINCT session_id) sesiones
        FROM events
        WHERE event_name != 'pageview'
        GROUP BY event_name
        ORDER BY sesiones DESC
        """
    ).fetchall()

    events_summary = []
    for r in rows:
        pct = (r["sesiones"] / total_pageviews * 100) if total_pageviews else 0
        events_summary.append(
            {
                "event_name": r["event_name"],
                "total": r["total"],
                "sesiones": r["sesiones"],
                "pct": round(pct, 1),
            }
        )

    # Métrica específica de la hipótesis: ¿la sesión hizo clic en un video
    # ANTES de hacer clic en "ver perfil" de un profesional?
    video_first = conn.execute(
        """
        SELECT s.session_id FROM (
            SELECT session_id, MIN(ts) AS video_ts
            FROM events WHERE event_name = 'click_video'
            GROUP BY session_id
        ) s
        LEFT JOIN (
            SELECT session_id, MIN(ts) AS perfil_ts
            FROM events WHERE event_name = 'click_ver_perfil'
            GROUP BY session_id
        ) p ON s.session_id = p.session_id
        WHERE p.perfil_ts IS NULL OR s.video_ts < p.perfil_ts
        """
    ).fetchall()

    sessions_with_video = conn.execute(
        "SELECT COUNT(DISTINCT session_id) c FROM events WHERE event_name = 'click_video'"
    ).fetchone()["c"]

    conn.close()

    video_first_pct = (
        round(len(video_first) / total_pageviews * 100, 1) if total_pageviews else 0
    )
    video_overall_pct = (
        round(sessions_with_video / total_pageviews * 100, 1) if total_pageviews else 0
    )

    return render_template(
        "dashboard.html",
        total_pageviews=total_pageviews,
        events_summary=events_summary,
        video_first_pct=video_first_pct,
        video_overall_pct=video_overall_pct,
        video_first_count=len(video_first),
        sessions_with_video=sessions_with_video,
    )


@app.route("/api/export")
def export_csv():
    conn = get_db()
    rows = conn.execute("SELECT * FROM events ORDER BY ts").fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "session_id", "event_name", "event_label", "page", "ts"])
    for r in rows:
        writer.writerow([r["id"], r["session_id"], r["event_name"], r["event_label"], r["page"], r["ts"]])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=contigo_eventos.csv"},
    )


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
else:
    init_db()
