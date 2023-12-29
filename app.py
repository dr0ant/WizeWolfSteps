import json
from flask import Flask, render_template, jsonify

app = Flask(__name__)

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
