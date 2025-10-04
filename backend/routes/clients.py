# routes/clients.py - Version adaptée à votre structure de données
from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import json

clients_bp = Blueprint('clients', __name__)

def get_clients_collection():
    from app import mongo
    return mongo.db.users

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

@clients_bp.route('/clients', methods=['GET'])
def get_clients():
    try:
        clients_collection = get_clients_collection()
        
        print("🔍 Recherche des utilisateurs dans immo_db.users...")
        
        # Récupérer tous les utilisateurs
        users = list(clients_collection.find({}))
        
        print(f"✅ {len(users)} utilisateurs trouvés")
        
        clients_data = []
        for user in users:
            # VOTRE STRUCTURE DE DONNÉES : name, email, password, city, dob, gender, phone
            name = user.get('name', '')
            # Séparer le nom complet en prénom et nom si possible
            name_parts = name.split(' ', 1)
            first_name = name_parts[0] if name_parts else name
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            # Déterminer le type basé sur l'email ou d'autres critères
            email = user.get('email', '')
            if 'admin' in email.lower():
                client_type = 'admin'
            else:
                client_type = user.get('role', 'buyer')  # Utiliser le rôle si disponible
            
            client_data = {
                'id': str(user.get('_id', '')),
                'firstName': first_name,
                'lastName': last_name,
                'email': email,
                'phone': user.get('phone', ''),
                'type': client_type,
                'status': user.get('status', 'active'),
                'address': user.get('address', user.get('city', '')),
                'budget': user.get('budget', ''),
                'preferences': user.get('preferences', ''),
                'createdAt': user.get('created_at', user.get('date_created', datetime.now())).isoformat()
            }
            
            # Nettoyer les données
            for key, value in client_data.items():
                if value is None:
                    client_data[key] = ''
            
            clients_data.append(client_data)
        
        print(f"📊 Données préparées: {len(clients_data)} clients")
        return json.dumps(clients_data, cls=JSONEncoder), 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify({'error': str(e)}), 500

# Route pour voir la structure exacte
@clients_bp.route('/clients/structure')
def get_structure():
    try:
        clients_collection = get_clients_collection()
        users = list(clients_collection.find().limit(5))
        
        if users:
            structures = []
            for user in users:
                structures.append({
                    'id': str(user.get('_id')),
                    'all_fields': list(user.keys()),
                    'sample_data': {
                        'name': user.get('name'),
                        'email': user.get('email'),
                        'phone': user.get('phone'),
                        'city': user.get('city'),
                        'gender': user.get('gender'),
                        'dob': user.get('dob')
                    }
                })
            
            return jsonify({
                'total_users': clients_collection.count_documents({}),
                'sample_structures': structures,
                'message': 'Structure détectée: name, email, phone, city, gender, dob'
            })
        else:
            return jsonify({'message': 'Aucun utilisateur trouvé'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Les autres routes REST restent inchangées
@clients_bp.route('/clients', methods=['POST'])
def create_client():
    try:
        data = request.json
        print(f"📨 Création client: {data}")
        
        clients_collection = get_clients_collection()
        
        # Vérifier si l'email existe déjà
        if clients_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'Un client avec cet email existe déjà'}), 400
        
        # Adapter à votre structure
        new_client = {
            'name': f"{data['firstName']} {data['lastName']}".strip(),
            'email': data['email'],
            'phone': data.get('phone', ''),
            'client_type': data['clientType'],
            'status': data['clientStatus'],
            'address': data.get('address', ''),
            'budget': data.get('budget', ''),
            'preferences': data.get('preferences', ''),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = clients_collection.insert_one(new_client)
        
        return jsonify({
            'id': str(result.inserted_id),
            'message': 'Client créé avec succès'
        }), 201
    except Exception as e:
        print(f"❌ Erreur création: {e}")
        return jsonify({'error': str(e)}), 500

@clients_bp.route('/clients/<client_id>', methods=['PUT'])
def update_client(client_id):
    try:
        data = request.json
        print(f"✏️ Mise à jour client {client_id}")
        
        clients_collection = get_clients_collection()
        
        update_data = {
            'name': f"{data['firstName']} {data['lastName']}".strip(),
            'email': data['email'],
            'phone': data.get('phone', ''),
            'client_type': data['clientType'],
            'status': data['clientStatus'],
            'address': data.get('address', ''),
            'budget': data.get('budget', ''),
            'preferences': data.get('preferences', ''),
            'updated_at': datetime.now()
        }
        
        # Supprimer les champs vides
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = clients_collection.update_one(
            {'_id': ObjectId(client_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Client non trouvé'}), 404
        
        return jsonify({'message': 'Client mis à jour avec succès'})
    except Exception as e:
        print(f"❌ Erreur mise à jour: {e}")
        return jsonify({'error': str(e)}), 500

@clients_bp.route('/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        print(f"🗑️ Suppression client {client_id}")
        
        clients_collection = get_clients_collection()
        
        result = clients_collection.delete_one({'_id': ObjectId(client_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Client non trouvé'}), 404
        
        return jsonify({'message': 'Client supprimé avec succès'})
    except Exception as e:
        print(f"❌ Erreur suppression: {e}")
        return jsonify({'error': str(e)}), 500