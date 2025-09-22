from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

# Charger .env
load_dotenv()

app = Flask(__name__)

# Activer CORS sur toute l'app (important pour React/Angular/Vue)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# Bcrypt
bcrypt = Bcrypt(app)

# Auth blueprint
from routes.auth import create_auth_routes
auth_bp = create_auth_routes(mongo, bcrypt)
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# Estimate blueprint
from routes.estimate import create_estimate_routes
estimate_bp = create_estimate_routes()
app.register_blueprint(estimate_bp, url_prefix="/api")

if __name__ == "__main__":
    # ⚠️ Sur Windows, debug=True peut causer WinError 10038
    app.run(port=5000, debug=False)
