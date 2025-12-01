from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

@app.get("/")
def home():
    return "Backend is running"

@app.post("/detect")
def detect():
    file = request.files['frame'].read()
    npimg = np.frombuffer(file, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    try:
        result = DeepFace.analyze(
            img_path=frame,
            actions=['emotion'],
            enforce_detection=False,
            silent=True
        )

        # FIX: deepface returns a LIST now
        if isinstance(result, list):
            result = result[0]

        emotion = result["dominant_emotion"]
        return jsonify({"emotion": emotion})

    except Exception as e:
        print("Error:", e)
        return jsonify({"emotion": "no_face"})
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
