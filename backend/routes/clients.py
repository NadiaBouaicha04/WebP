# routes/clients.py
from flask import Blueprint, request, jsonify
from bson import ObjectId
from bson.errors import InvalidId
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

# -------------------------------
# GET : tous les clients
# -------------------------------
@clients_bp.route('/clients', methods=['GET'])
def get_clients():
    try:
        clients_collection = get_clients_collection()
        users = list(clients_collection.find({}))
        
        clients_data = []
        for user in users:
            name = user.get('name', '')
            name_parts = name.split(' ', 1)
            first_name = name_parts[0] if name_parts else name
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            email = user.get('email', '')
            client_type = 'admin' if 'admin' in email.lower() else user.get('client_type', 'buyer')

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
                'createdAt': user.get('created_at', datetime.now()).isoformat(),
                'updatedAt': user.get('updated_at', datetime.now()).isoformat()
            }

            # Nettoyer les champs None
            client_data = {k: (v if v is not None else '') for k, v in client_data.items()}
            clients_data.append(client_data)
        
        return json.dumps(clients_data, cls=JSONEncoder), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# GET : un client par ID
# -------------------------------
@clients_bp.route('/clients/<client_id>', methods=['GET'])
def get_client(client_id):
    try:
        clients_collection = get_clients_collection()
        try:
            obj_id = ObjectId(client_id)
        except InvalidId:
            return jsonify({'error': 'ID invalide'}), 400

        client = clients_collection.find_one({'_id': obj_id})
        if not client:
            return jsonify({'error': 'Client non trouvé'}), 404

        name = client.get('name', '')
        name_parts = name.split(' ', 1)
        first_name = name_parts[0] if name_parts else name
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        email = client.get('email', '')
        client_type = 'admin' if 'admin' in email.lower() else client.get('client_type', 'buyer')

        client_data = {
            'id': str(client.get('_id', '')),
            'firstName': first_name,
            'lastName': last_name,
            'email': email,
            'phone': client.get('phone', ''),
            'type': client_type,
            'status': client.get('status', 'active'),
            'address': client.get('address', client.get('city', '')),
            'budget': client.get('budget', ''),
            'preferences': client.get('preferences', ''),
            'createdAt': client.get('created_at', datetime.now()).isoformat(),
            'updatedAt': client.get('updated_at', datetime.now()).isoformat()
        }

        return jsonify(client_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# POST : créer un client
# -------------------------------
@clients_bp.route('/clients', methods=['POST'])
def create_client():
    try:
        data = request.json
        clients_collection = get_clients_collection()

        if not data.get('email'):
            return jsonify({'error': 'Email requis'}), 400

        if clients_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'Un client avec cet email existe déjà'}), 400

        new_client = {
            'name': f"{data.get('firstName', '')} {data.get('lastName', '')}".strip(),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'client_type': data.get('clientType', 'buyer'),
            'status': data.get('clientStatus', 'active'),
            'address': data.get('address', ''),
            'budget': data.get('budget', ''),
            'preferences': data.get('preferences', ''),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        result = clients_collection.insert_one(new_client)
        return jsonify({'id': str(result.inserted_id), 'message': 'Client créé avec succès'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# PUT : mettre à jour un client
# -------------------------------
@clients_bp.route('/clients/<client_id>', methods=['PUT'])
def update_client(client_id):
    try:
        data = request.json
        clients_collection = get_clients_collection()

        try:
            obj_id = ObjectId(client_id)
        except InvalidId:
            return jsonify({'error': 'ID invalide'}), 400

        update_data = {
            'name': f"{data.get('firstName', '')} {data.get('lastName', '')}".strip(),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'client_type': data.get('clientType', 'buyer'),
            'status': data.get('clientStatus', 'active'),
            'address': data.get('address', ''),
            'budget': data.get('budget', ''),
            'preferences': data.get('preferences', ''),
            'updated_at': datetime.now()
        }

        # Supprimer les champs vides
        update_data = {k: v for k, v in update_data.items() if v}

        result = clients_collection.update_one({'_id': obj_id}, {'$set': update_data})
        if result.matched_count == 0:
            return jsonify({'error': 'Client non trouvé'}), 404

        return jsonify({'message': 'Client mis à jour avec succès'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# DELETE : supprimer un client
# -------------------------------
@clients_bp.route('/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        clients_collection = get_clients_collection()

        try:
            obj_id = ObjectId(client_id)
        except InvalidId:
            return jsonify({'error': 'ID invalide'}), 400

        result = clients_collection.delete_one({'_id': obj_id})
        if result.deleted_count == 0:
            return jsonify({'error': 'Client non trouvé'}), 404

        return jsonify({'message': 'Client supprimé avec succès'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# GET : structure des clients
# -------------------------------
@clients_bp.route('/clients/structure', methods=['GET'])
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