from flask import Blueprint, request, jsonify
from models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

def create_auth_routes(mongo, bcrypt):
    auth_bp = Blueprint("auth", __name__)
    user_model = User(mongo, bcrypt)

    # -------------------
    # Inscription
    # -------------------
    @auth_bp.route("/register", methods=["POST"])
    def register():
        data = request.get_json()
        print("Données reçues :", data)

        name = data.get("name")
        email = data.get("email")
        dob = data.get("dob")
        phone = data.get("phone")
        city = data.get("city")
        gender = data.get("gender")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not all([name, email, dob, phone, city, gender, password, confirm_password]):
            return jsonify({"error": "Tous les champs sont obligatoires"}), 400

        if password != confirm_password:
            return jsonify({"error": "Les mots de passe ne correspondent pas"}), 400

        if user_model.find_by_email(email):
            return jsonify({"error": "Email déjà utilisé"}), 400

        user_id = user_model.create_user(name, email, dob, phone, city, gender, password)
        return jsonify({"msg": "Inscription réussie !", "user_id": str(user_id)}), 201

    # -------------------
    # Connexion
    # -------------------
    @auth_bp.route("/login", methods=["POST"])
    def login():
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"msg": "Email et mot de passe requis"}), 400

        user = user_model.find_by_email(email)
        if not user or not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"msg": "Identifiants invalides"}), 401

        token = create_access_token(identity=str(user["_id"]))
        return jsonify({"msg": "Connexion réussie", "token": token})

    # -------------------
    # Profil utilisateur
    # -------------------
    @auth_bp.route("/me", methods=["GET"])
    @jwt_required()
    def get_profile():
        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)
        if not user:
            return jsonify({"msg": "Utilisateur introuvable"}), 404

        return jsonify({
            "user_id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "dob": user.get("dob"),
            "phone": user.get("phone"),
            "city": user.get("city"),
            "gender": user.get("gender")
        })

    return auth_bp
