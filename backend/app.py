from flask import Flask, jsonify, render_template, redirect, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
import jwt as pyjwt
from datetime import datetime, timedelta

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
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
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
# ROUTE POUR LE FRONTEND REACT
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

# -------------------
# Routes de base
# -------------------
@app.route('/')
def home():
    return redirect('/admin/dashboard')

@app.route('/admin')
def admin_redirect():
    return redirect('/admin/dashboard')

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
                
            except pyjwt.ExpiredSignatureError:
                return redirect('http://localhost:5173/login?error=token_expired')
            except pyjwt.InvalidTokenError:
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
        "status": "active"
    }), 200

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Route pour récupérer l'utilisateur connecté"""
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token manquant"}), 401
            
        token = auth_header.split(' ')[1]
        
        # Vérifier le token
        decoded_token = pyjwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user_email = decoded_token.get('sub')
        user_role = decoded_token.get('role', 'user')
        
        # Récupérer l'utilisateur depuis la base de données
        user = mongo.db.users.find_one({'email': user_email})
        
        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404
            
        return jsonify({
            "id": str(user['_id']),
            "email": user['email'],
            "name": user.get('name', 'Utilisateur'),
            "role": user.get('role', 'user'),
            "phone": user.get('phone', ''),
            "city": user.get('city', '')
        }), 200
        
    except pyjwt.ExpiredSignatureError:
        return jsonify({"error": "Token expiré"}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({"error": "Token invalide"}), 401
    except Exception as e:
        print(f" Erreur /auth/me: {e}")
        return jsonify({"error": "Erreur d'authentification"}), 500

@app.route('/admin/logout')
def admin_logout():
    """Route de déconnexion admin"""
    print("🚪 Déconnexion admin...")
    return redirect('http://localhost:5173/login?message=logout_success')

@app.route('/favicon.ico')
def favicon():
    return '', 204

# Route pour servir les fichiers uploadés
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    print(" Starting Carbon Footprint API...")
    print(" Server running on http://127.0.0.1:5000")
    
    # Créer le dossier uploads
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
        print(f" Dossier uploads créé: {app.config['UPLOAD_FOLDER']}")
    
    app.run(port=5000, debug=True)