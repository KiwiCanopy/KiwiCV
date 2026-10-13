# /// script
# dependencies = [
#   "requests",
#   "python-dateutil",
#   "python-dotenv",
# ]
# ///

import os
import sys
import requests
from dotenv import load_dotenv
from dateutil.parser import isoparse

# --- PFAD-LOGIK FÜR .env.local ---
# os.path.dirname(__file__) ist das Verzeichnis des Skripts.
# ".." springt einen Ordner höher.
script_dir = os.path.dirname(__file__)
dotenv_path = os.path.abspath(os.path.join(script_dir, "..", ".env.local"))

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    print(f"⚠️ Warnung: Keine .env.local unter {dotenv_path} gefunden.")

# --- KONFIGURATION ---
API_TOKEN = os.getenv("NETLIFY_AUTH_TOKEN")
SITE_ID = os.getenv("NETLIFY_SITE_ID")

# Wie viele der aktuellsten Previews sollen erhalten bleiben?
KEEP_LATEST_COUNT = 1
# -----------------------------------------

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def cleanup_previews():
    if not API_TOKEN or not SITE_ID:
        print("❌ Fehler: Umgebungsvariablen nicht geladen.")
        print(f"Gesuchter Pfad: {dotenv_path}")
        sys.exit(1)

    url = f"https://api.netlify.com/api/v1/sites/{SITE_ID}/deploys"
    
    try:
        # Wir holen die letzten 100 Deploys ab
        params = {"per_page": 100} 
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"❌ API-Fehler: {e}")
        return

    all_deploys = response.json()
    
    # Filtern: Nur Previews
    preview_deploys = [d for d in all_deploys if d.get('context') == 'deploy-preview']
    
    # Sortieren nach Erstellungsdatum (neueste zuerst)
    preview_deploys.sort(key=lambda d: isoparse(d['created_at']), reverse=True)

    total_previews = len(preview_deploys)
    if total_previews <= KEEP_LATEST_COUNT:
        print(f"✅ Alles sauber. Nur {total_previews} Previews vorhanden (Limit: {KEEP_LATEST_COUNT}).")
        return

    # Aufteilung
    to_delete = preview_deploys[KEEP_LATEST_COUNT:]
    
    print(f"📂 Datei geladen von: {dotenv_path}")
    print(f"📦 Insgesamt {total_previews} Previews gefunden.")
    print(f"🛡️  Behalte die {KEEP_LATEST_COUNT} neuesten.")
    print(f"🗑️  Lösche {len(to_delete)} alte Previews...\n")

    deleted_count = 0
    for deploy in to_delete:
        d_id = deploy['id']
        created = deploy['created_at']
        
        delete_url = f"https://api.netlify.com/api/v1/deploys/{d_id}"
        try:
            res = requests.delete(delete_url, headers=headers)
            if res.status_code in [200, 204]:
                print(f"  [DELETED] ID: {d_id} | {created}")
                deleted_count += 1
            else:
                print(f"  [FAILED]  ID: {d_id} | Status: {res.status_code}")
        except Exception as e:
            print(f"  [ERROR]   ID: {d_id} | {e}")

    print(f"\n--- ✅ Bereinigung abgeschlossen. {deleted_count} Deploys entfernt. ---")

if __name__ == "__main__":
    cleanup_previews()