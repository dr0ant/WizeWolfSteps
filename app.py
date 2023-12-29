import json
from flask import Flask, render_template, jsonify,request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Connect to MongoDB

with open('MongoDB/connexion_string.json', 'r') as file:
        connection_data = json.load(file)
        #print(connection_data['server'])
client = MongoClient(connection_data['server'])
db = client['Wolf_Steps']
markers_collection = db['Markers']

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
