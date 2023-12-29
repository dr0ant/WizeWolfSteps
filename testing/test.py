import json
import time
import base64
import geocoder
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime



with open('MongoDB/connexion_string.json', 'r') as file:
        connection_data = json.load(file)
        print(connection_data['server'])



def marker_creation():
    # Connect to MongoDB
    client = MongoClient(connection_data['server'])
    db = client['Wolf_Steps']
    markers_collection = db['Markers']
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
         # Check for existing documents based on the 'id' field
        existing_ids = markers_collection.distinct("id")
        new_markers = [marker for marker in markers["markers"] if marker["id"] not in existing_ids]

        # Insert only the new markers to MongoDB
        if new_markers:
            markers_collection.insert_many(new_markers)
            print(f"{len(new_markers)} new markers uploaded to MongoDB.")
        else:
            print("No new markers to upload.")

        return jsonify({"status": "success", "message": "Marker created successfully"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

def upload_markers_to_mongodb():
    # Connect to MongoDB
    client = MongoClient(connection_data['server'])
    db = client['Wolf_Steps']
    markers_collection = db['Markers']

    # Create some marker manually
    markers = {
        "markers": [
            {
                "id": "1",
                "title": "Gare",
                "label": "Hey je prend mon train aujourd'hui",
                "icon": "static/Assets/Step_white.png",
                "position": {
                    "latitude": 47.29170835967763,
                    "longitude": 0.7217011585334411
                }
            },
            {
                "id": "2",
                "title": "Bout de l impasse",
                "label": "D ici je vois la Gare de Montbabzon",
                "icon": "static/Assets/Step_white.png",
                "position": {
                    "latitude": 47.29127599162814,
                    "longitude": 0.7222885805538212
                }
            }
        ]
    }

    # Check for existing documents based on the 'id' field
    existing_ids = markers_collection.distinct("id")
    new_markers = [marker for marker in markers["markers"] if marker["id"] not in existing_ids]

    # Insert only the new markers to MongoDB
    if new_markers:
        markers_collection.insert_many(new_markers)
        print(f"{len(new_markers)} new markers uploaded to MongoDB.")
    else:
        print("No new markers to upload.")

def read_markers_from_mongodb():
    # Connect to MongoDB
    connection_data = json.load('/MongoDB/connexion_string.json')
    client = MongoClient(connection_data['server'])
    db = client['Wolf_Steps']
    markers_collection = db['Markers']

    # Read all markers from MongoDB
    all_markers = list(markers_collection.find({}, {"_id": 0}))

    return all_markers

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

def get_user_location():
    try:
        location = geocoder.ip('me')
        if location.ok:
            latitude, longitude = location.latlng
            return {'lat': latitude, 'lng': longitude}
        else:
            print(f"Failed to retrieve location information: {location}")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    



# Using time.time() for seconds precision
timestamp_seconds = int(time.time())
print("Timestamp (seconds):", timestamp_seconds)

# Using time.time_ns() for nanoseconds precision
timestamp_ns = time.time_ns()
print("Timestamp (nanoseconds):", timestamp_ns)


#print(get_user_location())

# Test the function separately
#if __name__ == '__main__':
#    markers_json = get_markers()
#    print(markers_json)

# Call the function to upload markers for debugging
#upload_markers_to_mongodb()

# Call the function to read all markers
#all_markers = read_markers_from_mongodb()

# Print the result
#print("All Markers:")
#print(json.dumps(all_markers, indent=2))


# Call the function for debugging
#upload_markers_to_mongodb()

#print(get_markers())

