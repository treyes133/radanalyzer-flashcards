from firebase_functions import https_fn, options
from firebase_admin import initialize_app, firestore
import json

initialize_app()
db = firestore.client()

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["GET", "POST"]))
def app(req: https_fn.Request) -> https_fn.Response:
    path = req.path.replace("/api", "", 1)
    
    if req.method == "GET" and "/cards/" in path:
        pin = path.split("/")[-1]
        try:
            doc = db.collection("flashcards").document(pin).get()
            cards = doc.to_dict().get("cards", []) if doc.exists else []
            return https_fn.Response(json.dumps(cards), content_type="application/json")
        except Exception as e:
            print(f"Error loading cards: {e}")
            return https_fn.Response("[]", content_type="application/json")
    
    elif req.method == "POST" and "/cards/" in path:
        pin = path.split("/")[-1]
        try:
            cards = req.get_json()
            db.collection("flashcards").document(pin).set({
                "cards": cards,
                "updatedAt": firestore.SERVER_TIMESTAMP
            })
            return https_fn.Response('{"success": true}', content_type="application/json")
        except Exception as e:
            print(f"Error saving cards: {e}")
            return https_fn.Response('{"error": "Failed to save cards"}', 
                                   status=500, content_type="application/json")
    
    return https_fn.Response(f"Path: {path}, Method: {req.method}", status=404)