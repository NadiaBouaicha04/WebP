from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson import ObjectId
import datetime

def create_auth_routes(mongo, bcrypt):
    auth_bp = Blueprint("auth", __name__)
    
    class UserModel:
        def __init__(self, mongo, bcrypt):
            self.db = mongo.db
            self.bcrypt = bcrypt
            self.users = self.db.users
        
        def find_by_email(self, email):
            try:
                return self.users.find_one({"email": email})
            except Exception as e:
                print(f"Database error in find_by_email: {e}")
                return None
        
        def find_by_id(self, user_id):
            try:
                return self.users.find_one({"_id": ObjectId(user_id)})
            except Exception as e:
                print(f"Database error in find_by_id: {e}")
                return None
        
        def create_user(self, name, email, dob, phone, city, gender, password):
            try:
                hashed_password = self.bcrypt.generate_password_hash(password).decode('utf-8')
                
                user_data = {
                    "name": name,
                    "email": email,
                    "dob": dob,
                    "phone": phone,
                    "city": city,
                    "gender": gender,
                    "password": hashed_password,
                    "role": "user",  # ← Rôle par défaut
                    "created_at": datetime.datetime.utcnow()
                }
                
                result = self.users.insert_one(user_data)
                return result.inserted_id
            except Exception as e:
                print(f"Database error in create_user: {e}")
                return None

    user_model = UserModel(mongo, bcrypt)

    # -------------------
    # Route test auth
    # -------------------
    @auth_bp.route("/", methods=["GET"])
    def auth_root():
        return jsonify({
            "message": "Auth routes are working!",
            "available_endpoints": {
                "register": "POST /register",
                "login": "POST /login", 
                "logout": "POST /logout",
                "profile": "GET /me (protected)"
            }
        }), 200

    # -------------------
    # Inscription
    # -------------------
    @auth_bp.route("/register", methods=["POST"])
    def register():
        try:
            if not request.is_json:
                return jsonify({"error": "Content-Type must be application/json"}), 400
                
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Aucune donnée JSON reçue"}), 400
            
            print("📨 Données reçues pour inscription:", data)

            # Extraction des données
            required_fields = ["name", "email", "dob", "phone", "city", "gender", "password", "confirm_password"]
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                return jsonify({"error": f"Champs manquants: {', '.join(missing_fields)}"}), 400

            name = data.get("name")
            email = data.get("email")
            dob = data.get("dob")
            phone = data.get("phone")
            city = data.get("city")
            gender = data.get("gender")
            password = data.get("password")
            confirm_password = data.get("confirm_password")

            # Validation
            if password != confirm_password:
                return jsonify({"error": "Les mots de passe ne correspondent pas"}), 400

            if len(password) < 6:
                return jsonify({"error": "Le mot de passe doit contenir au moins 6 caractères"}), 400

            # Vérifier si l'email existe
            if user_model.find_by_email(email):
                return jsonify({"error": "Email déjà utilisé"}), 400

            # Création utilisateur
            user_id = user_model.create_user(name, email, dob, phone, city, gender, password)
            
            if not user_id:
                return jsonify({"error": "Erreur lors de la création de l'utilisateur"}), 500
            
            return jsonify({
                "message": "Inscription réussie !", 
                "user_id": str(user_id)
            }), 201

        except Exception as e:
            print(f"❌ Erreur inscription: {e}")
            return jsonify({"error": "Erreur interne du serveur"}), 500

    # -------------------
    # Connexion
    # -------------------
    @auth_bp.route("/login", methods=["POST"])
    def login():
        try:
            if not request.is_json:
                return jsonify({"error": "Content-Type must be application/json"}), 400
                
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Aucune donnée JSON reçue"}), 400
            
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return jsonify({"error": "Email et mot de passe requis"}), 400

            user = user_model.find_by_email(email)
            if not user:
                return jsonify({"error": "Email ou mot de passe incorrect"}), 401

            # Vérifier le mot de passe
            if not bcrypt.check_password_hash(user["password"], password):
                return jsonify({"error": "Email ou mot de passe incorrect"}), 401

            # Récupérer le rôle (par défaut "user" si non défini)
            user_role = user.get("role", "user")
            
            # Déterminer la redirection selon le rôle
            redirect_to = "/admin" if user_role == "admin" else "/"

            # Créer le token JWT avec le rôle en payload
            token = create_access_token(identity=str(user["_id"]))
            
            return jsonify({
                "message": "Connexion réussie", 
                "token": token,
                "user": {
                    "id": str(user["_id"]),
                    "name": user.get("name"),
                    "email": user.get("email"),
                    "role": user_role
                },
                "redirectTo": redirect_to
            }), 200

        except Exception as e:
            print(f"❌ Erreur connexion: {e}")
            return jsonify({"error": "Erreur interne du serveur"}), 500

    # -------------------
    # Déconnexion - NOUVELLE ROUTE
    # -------------------
    @auth_bp.route("/logout", methods=["POST"])
    @jwt_required()
    def logout():
        try:
            # Dans une application plus avancée, vous pourriez blacklister le token ici
            # Pour l'instant, on se contente de supprimer le token côté client
            return jsonify({"message": "Déconnexion réussie"}), 200
        except Exception as e:
            print(f"❌ Erreur déconnexion: {e}")
            return jsonify({"error": "Erreur lors de la déconnexion"}), 500

    # -------------------
    # Profil utilisateur
    # -------------------
    @auth_bp.route("/me", methods=["GET"])
    @jwt_required()
    def get_profile():
        try:
            user_id = get_jwt_identity()
            user = user_model.find_by_id(user_id)
            
            if not user:
                return jsonify({"error": "Utilisateur introuvable"}), 404

            return jsonify({
                "user_id": str(user["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "dob": user.get("dob"),
                "phone": user.get("phone"),
                "city": user.get("city"),
                "gender": user.get("gender"),
                "role": user.get("role", "user")
            }), 200
            
        except Exception as e:
            print(f"❌ Erreur profil: {e}")
            return jsonify({"error": "Erreur d'authentification"}), 401

    return auth_bp