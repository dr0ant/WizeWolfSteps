import json
import time
from flask import Flask, render_template, jsonify,request,redirect
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



@app.route('/create_marker', methods=['POST'])
def create_marker():
    # Extract form data
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    image = request.files.get('image')
    sound = request.files.get('sound')
    name = request.form.get('name')
    text = request.form.get('text')
    user_id = request.form.get('user_id')

  # Encode image and sound files to Base64
    image_data = base64.b64encode(image.read()).decode('utf-8')
    sound_data = base64.b64encode(sound.read()).decode('utf-8')

    # Insert data into MongoDB
    marker_data = {
        'id':   str(time.time_ns()),
        'creation_datetime': str(datetime.now()),
        'title': name,
        'label': text,
        'icon': 'static/Assets/Step_white.png',
        'image_base64': image_data,
        'sound_base64': sound_data,
        'user_id': user_id,
        'position':{
             'latitude': float(latitude),
             'longitude': float(longitude)

        }
    }

    markers_collection.insert_one(marker_data)

    # Redirect to the root page after successfully creating a marker
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
