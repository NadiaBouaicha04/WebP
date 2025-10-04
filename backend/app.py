from flask import Flask, jsonify, render_template, redirect, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
import jwt as pyjwt

# Charger .env
load_dotenv()

app = Flask(__name__)

# Configuration CORS plus permissive
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/carbon_footprint")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "clé_par_défaut_très_secrete_pour_dev")
app.config['UPLOAD_FOLDER'] = 'uploads'

# Configuration CORS pour accepter toutes les origines
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000", 
            "http://127.0.0.1:3000", 
            "http://localhost:3001",
            "http://localhost:5174",      # Vite port
            "http://127.0.0.1:5174" ,
            "http://localhost:5173",      # ← AJOUTEZ CELUI-CI
            "http://127.0.0.1:5173"          # Vite port
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Extensions
mongo = PyMongo(app)

# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# Bcrypt
bcrypt = Bcrypt(app)

# -------------------
# Import des Blueprints
# -------------------
print(" Chargement des blueprints...")

try:
    # Blueprint Auth
    from routes.auth import create_auth_routes
    auth_bp = create_auth_routes(mongo, bcrypt)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    print(" Blueprint auth enregistré")

    # Blueprint Pages (Admin)
    from routes.pages import pages_bp
    app.register_blueprint(pages_bp)
    print(" Blueprint pages enregistré")

    # Blueprint Clients API
    from routes.clients import clients_bp
    app.register_blueprint(clients_bp, url_prefix="/api")
    print(" Blueprint clients API enregistré")

    # Blueprint Properties API
    from routes.properties import properties_bp
    app.register_blueprint(properties_bp, url_prefix="/api")
    print(" Blueprint properties API enregistré")

except Exception as e:
    print(f" ERREUR lors du chargement des blueprints: {e}")
    import traceback
    traceback.print_exc()

# -------------------
# Routes de test pour React
# -------------------
@app.route('/api/test-react')
def test_react_connection():
    """Route de test spécifique pour React"""
    return jsonify({
        "message": "API Flask fonctionne correctement !",
        "status": "success", 
        "react_connection": "active",
        "endpoints": {
            "properties": "/api/api/properties",
            "test": "/api/test-react"
        }
    })

# -------------------
# NOUVELLE ROUTE POUR LE FRONTEND REACT
# -------------------
@app.route('/api/biens', methods=['GET'])
def get_all_biens():
    """Route pour récupérer tous les biens pour React"""
    try:
        print(" Récupération de tous les biens pour React...")
        
        # Récupérer tous les biens (sans filtre de statut d'abord)
        biens = list(mongo.db.properties.find({}))
        
        # Si la collection properties est vide, essayez annonces
        if not biens:
            print(" Collection 'properties' vide, essai avec 'annonces'...")
            biens = list(mongo.db.annonces.find({}))
        
        print(f" {len(biens)} biens trouvés au total")
        
        # Convertir ObjectId en string et préparer les données
        biens_data = []
        for bien in biens:
            bien_data = {
                'id': str(bien['_id']),
                'titre': bien.get('titre', 'Sans titre'),
                'description': bien.get('description', ''),
                'type': bien.get('type', 'Non spécifié'),
                'prix': bien.get('prix', 0),
                'surface': bien.get('surface', 0),
                'chambres': bien.get('chambres', 0),
                'salles_de_bain': bien.get('salles_de_bain', 1),
                'ville': bien.get('ville', ''),
                'adresse': bien.get('adresse', ''),
                'code_postal': bien.get('code_postal', ''),
                'statut': bien.get('statut', 'disponible'),
                'images': bien.get('images', []),
                'caracteristiques': bien.get('caracteristiques', [])
            }
            biens_data.append(bien_data)
        
        return jsonify({
            "success": True,
            "count": len(biens_data),
            "biens": biens_data
        })
        
    except Exception as e:
        print(f" Erreur dans /api/biens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Route de test améliorée
@app.route('/api/test-data', methods=['GET'])
def test_data():
    """Route de test avec des données réelles"""
    try:
        # Compter les documents dans différentes collections
        collections_info = {
            'properties': mongo.db.properties.count_documents({}),
            'annonces': mongo.db.annonces.count_documents({})
        }
        
        return jsonify({
            "message": " API Flask fonctionne",
            "collections": collections_info,
            "routes_disponibles": [
                "/api/biens",
                "/api/test-data", 
                "/api/test-react",
                "/api/simple/properties"
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route simple pour les biens (sans filtres complexes)
@app.route('/api/simple/properties')
def simple_properties():
    """Version simplifiée pour debug"""
    try:
        from app import mongo
        properties = list(mongo.db.annonces.find({"statut": "disponible"}).limit(10))
        
        properties_data = []
        for property in properties:
            # URLs d'images simples
            images_with_urls = []
            for image in property.get('images', []):
                images_with_urls.append(f"http://127.0.0.1:5000/uploads/properties/{image}")
            
            property_data = {
                'id': str(property['_id']),
                'titre': property.get('titre', 'Sans titre'),
                'description': property.get('description', ''),
                'type': property.get('type', 'Appartement'),
                'prix': property.get('prix', 0),
                'surface': property.get('surface', 0),
                'chambres': property.get('chambres', 0),
                'ville': property.get('ville', ''),
                'images': images_with_urls,
            }
            properties_data.append(property_data)
        
        return jsonify({
            "success": True,
            "count": len(properties_data),
            "properties": properties_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# -------------------
# ROUTE LOGIN DE TEST DIRECTE
# -------------------
# AJOUTEZ CETTE ROUTE SPÉCIFIQUE POUR LE LOGIN
@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def handle_login():
    """Route de login avec gestion CORS complète"""
    if request.method == 'OPTIONS':
        # Réponse pre-flight CORS
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')  # ← 5173
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
    
    try:
        data = request.get_json()
        print(f"🔐 Tentative de connexion: {data.get('email')}")
        
        email = data.get('email')
        password = data.get('password')
        
        # Simulation de connexion pour test
        if email == "admin@example.com" and password == "admin123":
            response_data = {
                "success": True,
                "message": "Connexion réussie",
                "token": "fake-jwt-token-admin-12345",
                "user": {
                    "id": "1",
                    "email": email,
                    "role": "admin",
                    "name": "Administrateur"
                },
                "redirect": "/admin/dashboard"
            }
        elif email == "user@example.com" and password == "password123":
            response_data = {
                "success": True,
                "message": "Connexion réussie",
                "token": "fake-jwt-token-user-67890",
                "user": {
                    "id": "2", 
                    "email": email,
                    "role": "user",
                    "name": "Utilisateur"
                },
                "redirect": "/"
            }
        else:
            response_data = {
                "success": False,
                "error": "Email ou mot de passe incorrect"
            }
            
        # Ajouter les headers CORS à la réponse
        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')  # ← 5173
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        
        return response, 200 if response_data.get('success') else 401
            
    except Exception as e:
        print(f"❌ Erreur login: {e}")
        response = jsonify({
            "success": False,
            "error": str(e)
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')  # ← 5173
        return response, 500

# -------------------
# Routes de base
# -------------------
@app.route('/')
def home():
    return redirect('/admin/dashboard')

@app.route('/admin')
def admin_redirect():
    return redirect('/admin/dashboard')

# ROUTE DASHBOARD UNIQUE
# ROUTE DASHBOARD UNIQUE
@app.route('/admin/dashboard')
def admin_dashboard():
    """Dashboard admin avec vérification du token"""
    try:
        token = request.args.get('token')
        print(f"🎯 Route /admin/dashboard appelée - Token: {token}")
        
        if token:
            try:
                # Vérifier le token JWT
                decoded_token = pyjwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
                user_email = decoded_token.get('sub', 'Administrateur')
                user_role = decoded_token.get('role', 'user')
                
                print(f"✅ Admin connecté: {user_email} (Rôle: {user_role})")
                
                if user_role != 'admin':
                    return redirect('http://localhost:5173/login?error=access_denied')
                
                return render_template('dashboard.html', username=user_email)
                
            except Exception as e:
                print(f"❌ Token invalide: {e}")
                return redirect('http://localhost:5173/login?error=invalid_token')
        else:
            print("⚠️ Mode développement: accès sans token")
            return render_template('dashboard.html', username="Développeur")
            
    except Exception as e:
        print(f"❌ Erreur dashboard: {e}")
        return redirect('http://localhost:5173/login?error=server_error')
@app.route('/admin/clients')
def admin_clients():
    return render_template('admin/clients.html')

@app.route('/admin/properties')
def admin_properties():
    return render_template('admin/properties.html')

@app.route('/api')
def api_info():
    return jsonify({
        "message": "Carbon Footprint API is running!",
        "status": "active",
        "react_endpoints": {
            "test": "/api/test-react",
            "simple_properties": "/api/simple/properties", 
            "properties": "/api/api/properties"
        }
    }), 200



@app.route('/admin/logout')
def admin_logout():
    """Route de déconnexion admin"""
    print("🚪 Déconnexion admin...")
    # Rediriger vers le login React
    return redirect('http://localhost:5173/login?message=logout_success')

@app.route('/favicon.ico')
def favicon():
    return '', 204

# Route pour servir les fichiers uploadés
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Debug routes
@app.route('/debug/routes')
def debug_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        if 'static' not in str(rule):
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'path': str(rule)
            })
    return jsonify(routes)

@app.route('/api/test')
def test_api():
    return jsonify({
        "message": "API test successful",
        "react_connection": "active"
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "react_endpoints": [
            "/api/test-react",
            "/api/simple/properties",
            "/api/api/properties"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    print(" Starting Carbon Footprint API...")
    print(" Server running on http://127.0.0.1:5000")
    print(" CORS enabled for React on http://localhost:5174")
    
    # Créer le dossier uploads
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
        print(f" Dossier uploads créé: {app.config['UPLOAD_FOLDER']}")
    
    # Routes pour React
    print(" Endpoints pour React:")
    print("   - GET /api/test-react")
    print("   - GET /api/simple/properties") 
    print("   - GET /api/api/properties")
    
    # Routes pour l'admin
    print(" Routes Admin:")
    print("   - GET /admin/dashboard")
    print("   - GET /admin/clients")
    print("   - GET /admin/properties")
    
    app.run(port=5000, debug=True)