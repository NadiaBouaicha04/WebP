# routes/properties.py
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from bson import ObjectId
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename

properties_bp = Blueprint('properties', __name__)

# Configuration pour l'upload d'images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_properties_collection():
    from app import mongo
    return mongo.db.annonces

def get_upload_folder():
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'properties')
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)
    return upload_path

# Route pour servir les images
@properties_bp.route('/uploads/properties/<filename>')
def get_property_image(filename):
    try:
        return send_from_directory(get_upload_folder(), filename)
    except Exception as e:
        print(f"❌ Erreur chargement image {filename}: {e}")
        return jsonify({"error": "Image non trouvée"}), 404

# Route principale pour récupérer les biens
@properties_bp.route('/properties', methods=['GET'])
def get_properties():
    try:
        properties_collection = get_properties_collection()
        
        # Récupérer tous les biens
        properties = list(properties_collection.find().sort('date_creation', -1))
        
        properties_data = []
        for property in properties:
            # Construire les URLs des images
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
                'salles_de_bain': property.get('salles_de_bain', 1),
                'ville': property.get('ville', ''),
                'adresse': property.get('adresse', ''),
                'code_postal': property.get('code_postal', ''),
                'images': images_with_urls,
                'statut': property.get('statut', 'disponible'),
                'caracteristiques': property.get('caracteristiques', []),
                'etage': property.get('etage', ''),
                'annee_construction': property.get('annee_construction', ''),
                'date_creation': property.get('date_creation', datetime.now()).isoformat(),
                'date_modification': property.get('date_modification', datetime.now()).isoformat()
            }
            properties_data.append(property_data)
        
        return jsonify({
            "success": True,
            "count": len(properties_data),
            "properties": properties_data
        })
        
    except Exception as e:
        print(f"❌ Erreur récupération biens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Créer un nouveau bien
@properties_bp.route('/properties', methods=['POST'])
def create_property():
    try:
        data = request.form.to_dict()
        files = request.files.getlist('images')
        
        properties_collection = get_properties_collection()
        
        print(f"📥 Données reçues: {data}")
        print(f"📁 Fichiers reçus: {len(files)} images")
        
        # Traitement des images
        image_filenames = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(get_upload_folder(), unique_filename)
                file.save(file_path)
                image_filenames.append(unique_filename)
                print(f"✅ Image sauvegardée: {unique_filename}")
        
        # Préparer les données du bien
        new_property = {
            'titre': data.get('titre', ''),
            'description': data.get('description', ''),
            'type': data.get('type', 'Appartement'),
            'prix': int(data.get('prix', 0)),
            'surface': int(data.get('surface', 0)),
            'chambres': int(data.get('chambres', 0)),
            'salles_de_bain': int(data.get('salles_de_bain', 1)),
            'ville': data.get('ville', ''),
            'adresse': data.get('adresse', ''),
            'code_postal': data.get('code_postal', ''),
            'images': image_filenames,
            'statut': 'disponible',
            'caracteristiques': [c.strip() for c in data.get('caracteristiques', '').split(',') if c.strip()],
            'etage': data.get('etage', ''),
            'annee_construction': data.get('annee_construction', ''),
            'date_creation': datetime.now(),
            'date_modification': datetime.now()
        }
        
        result = properties_collection.insert_one(new_property)
        
        return jsonify({
            'success': True,
            'id': str(result.inserted_id),
            'message': 'Bien créé avec succès',
            'images_uploaded': len(image_filenames)
        }), 201
        
    except Exception as e:
        print(f"❌ Erreur création bien: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Modifier un bien
@properties_bp.route('/properties/<property_id>', methods=['PUT'])
def update_property(property_id):
    try:
        data = request.form.to_dict()
        files = request.files.getlist('images')
        
        properties_collection = get_properties_collection()
        
        # Traitement des nouvelles images
        new_image_filenames = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(get_upload_folder(), unique_filename)
                file.save(file_path)
                new_image_filenames.append(unique_filename)
        
        # Récupérer le bien existant
        existing_property = properties_collection.find_one({'_id': ObjectId(property_id)})
        if not existing_property:
            return jsonify({'error': 'Bien non trouvé'}), 404
        
        # Préparer les données de mise à jour
        update_data = {
            'titre': data.get('titre', existing_property.get('titre')),
            'description': data.get('description', existing_property.get('description')),
            'type': data.get('type', existing_property.get('type')),
            'prix': int(data.get('prix', existing_property.get('prix', 0))),
            'surface': int(data.get('surface', existing_property.get('surface', 0))),
            'chambres': int(data.get('chambres', existing_property.get('chambres', 0))),
            'salles_de_bain': int(data.get('salles_de_bain', existing_property.get('salles_de_bain', 1))),
            'ville': data.get('ville', existing_property.get('ville')),
            'adresse': data.get('adresse', existing_property.get('adresse')),
            'code_postal': data.get('code_postal', existing_property.get('code_postal')),
            'caracteristiques': [c.strip() for c in data.get('caracteristiques', '').split(',') if c.strip()],
            'etage': data.get('etage', existing_property.get('etage')),
            'annee_construction': data.get('annee_construction', existing_property.get('annee_construction')),
            'date_modification': datetime.now()
        }
        
        # Ajouter les nouvelles images si elles existent
        if new_image_filenames:
            update_data['images'] = existing_property.get('images', []) + new_image_filenames
        
        properties_collection.update_one(
            {'_id': ObjectId(property_id)},
            {'$set': update_data}
        )
        
        return jsonify({
            'success': True,
            'message': 'Bien modifié avec succès',
            'images_uploaded': len(new_image_filenames)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Supprimer un bien
@properties_bp.route('/properties/<property_id>', methods=['DELETE'])
def delete_property(property_id):
    try:
        properties_collection = get_properties_collection()
        
        result = properties_collection.delete_one({'_id': ObjectId(property_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Bien non trouvé'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Bien supprimé avec succès'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500