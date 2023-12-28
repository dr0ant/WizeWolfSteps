from flask import Flask, render_template, jsonify
import json
import requests

app = Flask(__name__)

def load_api_keys():
    # Load API keys from the JSON file
    with open('ApiKeys/GoogleAPIKEY.json', 'r') as file:
        api_keys_data = json.load(file)
    return api_keys_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_google_maps_link')
def get_google_maps_link():
    # Fetch the JSON data containing Maps API Key and Map IDs
    try:
        data = load_api_keys()
        maps_api_key = data.get('Maps_API_Key')
        print(maps_api_key)
        maps_ids = data.get('Maps_ids')
        print(maps_ids)
        
        # Construct the Google Maps API link
        google_maps_api_link = f'https://maps.googleapis.com/maps/api/js?key={maps_api_key}&map_ids={maps_ids}&callback=initMap'
        print(google_maps_api_link)
        print(jsonify({'googleMapsApiLink': google_maps_api_link}))
        return jsonify({'googleMapsApiLink': google_maps_api_link})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
      
if __name__ == '__main__':
    app.run(debug=True)
