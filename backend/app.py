from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

# Charger .env
load_dotenv()

app = Flask(__name__)

# Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/carbon_footprint")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "clé_par_défaut_très_secrete_pour_dev")

# Extensions
CORS(app)
mongo = PyMongo(app)

# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# Bcrypt
bcrypt = Bcrypt(app)

# -------------------
# Routes de base
# -------------------
@app.route('/')
def home():
    return jsonify({
        "message": "Carbon Footprint API is running!",
        "status": "active",
        "endpoints": {
            "auth_root": "/api/auth/",
            "login": "/api/auth/login", 
            "register": "/api/auth/register",
            "profile": "/api/auth/me",
            "admin": "/admin"
        }
    }), 200

@app.route('/admin')
def admin_dashboard():
    stats = {
        'sales': '1,259',
        'purchases': '352',
        'orders': '894',
        'profit': '12,584',
        'progress': '65'
    }
    return render_template('dashboard.html', stats=stats, username="Nadaaaaaa")

@app.route('/favicon.ico')
def favicon():
    return '', 204

# -------------------
# DEBUG: Route pour voir toutes les routes enregistrées
# -------------------
@app.route('/debug/routes')
def debug_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        if 'static' not in str(rule):  # Exclure les routes static
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'path': str(rule)
            })
    return jsonify(routes)

# -------------------
# Blueprint Auth - DEBUG AMÉLIORÉ
# -------------------
print("🔄 Tentative d'import du blueprint auth...")

try:
    # Vérifier si le fichier existe
    routes_path = os.path.join(os.path.dirname(__file__), 'routes', 'auth.py')
    print(f"📁 Chemin du fichier auth.py: {routes_path}")
    print(f"📁 Fichier existe: {os.path.exists(routes_path)}")
    
    if os.path.exists(routes_path):
        from routes.auth import create_auth_routes
        print("✅ Import de create_auth_routes réussi")
        
        auth_bp = create_auth_routes(mongo, bcrypt)
        print("✅ Blueprint auth créé")
        
        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        print("✅ Blueprint auth enregistré avec préfixe /api/auth")
        
        # Vérifier les routes du blueprint
        print("📋 Routes du blueprint auth:")
        for rule in auth_bp.url_map.iter_rules():
            print(f"   - {rule.methods} {rule}")
    else:
        print("❌ Fichier auth.py introuvable")
        print("📂 Contenu du dossier routes:", os.listdir('routes') if os.path.exists('routes') else "Dossier routes n'existe pas")
        
except Exception as e:
    print(f"❌ ERREUR lors de l'enregistrement du blueprint auth: {e}")
    import traceback
    traceback.print_exc()

# -------------------
# Route de test pour vérifier l'API
# -------------------
@app.route('/api/test')
def test_api():
    return jsonify({
        "message": "API test successful",
        "auth_available": True
    }), 200

# -------------------
# Error handlers
# -------------------
@app.errorhandler(404)
def not_found(error):
    # Récupérer toutes les routes disponibles
    available_routes = []
    for rule in app.url_map.iter_rules():
        if 'static' not in str(rule):
            available_routes.append(str(rule))
    
    return jsonify({
        "error": "Endpoint not found", 
        "available_endpoints": sorted(available_routes)
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    print("🚀 Starting Carbon Footprint API...")
    print("📍 Server running on http://127.0.0.1:5000")
    
    # Liste toutes les routes disponibles
    print("📋 Toutes les routes enregistrées:")
    for rule in app.url_map.iter_rules():
        if 'static' not in str(rule):
            print(f"   - {list(rule.methods)} {rule}")
    
    app.run(port=5000, debug=True)