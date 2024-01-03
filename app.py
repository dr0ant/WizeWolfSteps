import json
import time
import base64
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from flask_socketio import SocketIO
from bson import ObjectId
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)  # Initialize SocketIO
app.config['SECRET_KEY'] = 'your_secret_key'  # Change this to a strong, random key
bcrypt = Bcrypt(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Connect to MongoDB
with open('MongoDB/connexion_string.json', 'r') as file:
    connection_data = json.load(file)

client = MongoClient(connection_data['server'])
db = client['Wolf_Steps']
markers_collection = db['Markers']
users_collection = db['Profiles']  # Add a new collection for user data

# Define a user class for Flask-Login
class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

# User loader function for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

# Get markers from MongoDB
@app.route('/get_markers', methods=['GET'])
def get_markers():
    class MongoEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            return json.JSONEncoder.default(self, obj)

    all_markers = list(markers_collection.find({}, {"_id": 0}))
    return json.dumps(all_markers, cls=MongoEncoder)

# Load API key function
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
    api_key_data = load_api_key_from_file()

    if api_key_data:
        print("API Key Data:", api_key_data)
        return jsonify(api_key_data)
    else:
        return jsonify({'error': 'Unable to load API key data'})

# Registration route
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        username = request.form['username']

        # Check if the email is already registered
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return render_template('register.html', error='Email already registered')

        # Hash the password before storing it
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create a new user
        new_user = {
            'email': email,
            'password': hashed_password,
            'username': username
        }
        users_collection.insert_one(new_user)

        return redirect(url_for('login'))

    return render_template('register.html')

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = users_collection.find_one({'email': email})

        if user and bcrypt.check_password_hash(user['password'], password):
            user_obj = User(str(user['_id']))
            login_user(user_obj)
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Invalid email or password')

    return render_template('login.html')

# Logout route
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/create_marker', methods=['POST'])
@login_required
def create_marker():
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    image = request.files.get('image')
    sound = request.files.get('sound')
    name = request.form.get('name')
    text = request.form.get('text')
    user_id = current_user.id

    image_data = base64.b64encode(image.read()).decode('utf-8')
    sound_data = base64.b64encode(sound.read()).decode('utf-8')

    marker_data = {
        'id': str(time.time_ns()),
        'creation_datetime': str(datetime.now()),
        'title': name,
        'label': text,
        'icon': 'static/Assets/Step_white.png',
        'image_base64': image_data,
        'sound_base64': sound_data,
        'user_id': user_id,
        'position': {
            'latitude': float(latitude),
            'longitude': float(longitude)
        }
    }

    markers_collection.insert_one(marker_data)

    return redirect(url_for('index'))


if __name__ == '__main__':
    socketio.run(app, debug=True)
