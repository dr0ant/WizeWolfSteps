from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/get_keys')
def get_keys():
    # Replace this with your logic to load and return API keys
    keys_data = {
        "Maps_API_Key": "your_maps_api_key",
        "Maps_ids": "your_maps_ids"
    }
    return jsonify(keys_data)

if __name__ == '__main__':
    app.run(debug=True)
