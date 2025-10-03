from bson import ObjectId

class User:
    def __init__(self, mongo, bcrypt):
        self.mongo = mongo
        self.bcrypt = bcrypt
        self.collection = self.mongo.db.users

    def find_by_email(self, email):
        """Récupère un utilisateur par email"""
        return self.collection.find_one({"email": email})

    def find_by_id(self, user_id):
        """Récupère un utilisateur par ID MongoDB"""
        if not ObjectId.is_valid(user_id):
            return None
        return self.collection.find_one({"_id": ObjectId(user_id)})

    def create_user(self, name, email, dob, phone, city, gender, password, role="user"):
        """Crée un nouvel utilisateur avec mot de passe hashé et rôle"""
        hashed_pw = self.bcrypt.generate_password_hash(password).decode('utf-8')
        user_data = {
            "name": name,
            "email": email,
            "password": hashed_pw,
            "dob": dob,
            "phone": phone,
            "city": city,
            "gender": gender,
            "role": role,  # ← Ajout du rôle
            "created_at": datetime.datetime.utcnow()
        }
        result = self.collection.insert_one(user_data)
        return str(result.inserted_id)

    def check_password(self, user, password):
        """Vérifie si le mot de passe correspond au hash"""
        if not user or not user.get("password"):
            return False
        return self.bcrypt.check_password_hash(user["password"], password)

    def promote_to_admin(self, user_id):
        """Promouvoir un utilisateur en admin"""
        if not ObjectId.is_valid(user_id):
            return False
        result = self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": "admin"}}
        )
        return result.modified_count > 0