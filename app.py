import json
from flask import Flask, render_template, jsonify,request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Connect to MongoDB

with open('MongoDB/connexion_string.json', 'r') as file:
        connection_data = json.load(file)
        #print(connection_data['server'])
client = MongoClient(connection_data['server'])
db = client['Wolf_Steps']
markers_collection = db['Markers']



# Marker Creation

@app.route('/marker_creation', methods=['POST'])
def marker_creation():
    try:
        # Extract information from the form data
        latitude = float(request.form.get('latitude', 0.0))
        longitude = float(request.form.get('longitude', 0.0))
        image_base64 = request.form.get('image_base64', '')
        sound_base64 = request.form.get('sound_base64', '')
        text = request.form.get('text', '')
        name = request.form.get('name', '')
        user_id = int(request.form.get('user_id', 666))

        # Decode base64-encoded image and sound
        image_data = base64.b64decode(image_base64)
        sound_data = base64.b64decode(sound_base64)

        # Get the creation time
        creation_time = datetime.now()

        # Create the marker object
        marker = {
            "latitude": latitude,
            "longitude": longitude,
            "image": image_data,
            "sound": sound_data,
            "text": text,
            "name": name,
            "user_id": user_id,
            "creation_time": creation_time
        }

        # Insert the marker into the MongoDB collection
        markers_collection.insert_one(marker)

        return jsonify({"status": "success", "message": "Marker created successfully"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})









# Save marker to MongoDB
@app.route('/saveMarker', methods=['POST'])
def save_marker(): 
    marker_data = request.json
    markers_collection.insert_one(marker_data)
    return jsonify({'success': True})

# Get markers from MongoDB
@app.route('/get_markers', methods=['GET'])
def get_markers():
    class MongoEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            return json.JSONEncoder.default(self, obj)

    # Connect to MongoDB
    client = MongoClient(connection_data['server'])
    db = client['Wolf_Steps']
    markers_collection = db['Markers']

    # Read all markers from MongoDB
    all_markers = list(markers_collection.find({}, {"_id": 0}))

    # Use the custom encoder when converting to JSON
    return json.dumps(all_markers, cls=MongoEncoder)

def load_api_key_from_file():
    try:
        with open('ApiKeys/GoogleAPIKEY.json', 'r') as file:
            api_key_data = json.load(file)
        return api_key_data
    except FileNotFoundError:
        print("Error: ApiKeys/GoogleAPIKEY.json not found.")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_api_key')
def get_api_key():
    # Load the API key data from the file
    api_key_data = load_api_key_from_file()

    if api_key_data:
        print("API Key Data:", api_key_data)  # Add this line for debugging
        return jsonify(api_key_data)
    else:
        # Return an error response if the file is not found or cannot be read
        return jsonify({'error': 'Unable to load API key data'})


if __name__ == '__main__':
    app.run(debug=True)
