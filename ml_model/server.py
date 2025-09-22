from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import json

app = Flask(__name__)
CORS(app)

# Charger le modèle et les métadonnées
model = joblib.load('immobilier_tunisie_model.pkl')
with open('model_metadata.json', 'r') as f:
    model_metadata = json.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Récupérer les données du formulaire
        data = request.json
        
        # Préparer les données pour la prédiction
        input_data = {
            'Rooms': float(data['Rooms']),
            'Area (m²)': float(data['Area'])
        }
        
        # Ajouter les variables one-hot encoded
        for feature in model_metadata['features']:
            if feature.startswith('Governorate_'):
                gov_name = feature.replace('Governorate_', '')
                input_data[feature] = 1 if data['Governorate'] == gov_name else 0
            elif feature.startswith('Category_'):
                cat_name = feature.replace('Category_', '')
                input_data[feature] = 1 if data['Category'] == cat_name else 0
            elif feature not in input_data:
                input_data[feature] = 0
        
        # Créer le dataframe dans le bon ordre
        input_df = pd.DataFrame([input_data])
        input_df = input_df[model_metadata['features']]
        
        # Faire la prédiction
        log_prediction = model.predict(input_df)[0]
        prediction = np.exp(log_prediction)
        
        # Calculer un score de confiance (simplifié)
        confidence = min(95, max(70, 100 - (abs(log_prediction - np.log(model_metadata['mean_price'])) / np.log(model_metadata['std_price']) * 20)))
        
        return jsonify({
            'prediction': prediction,
            'confidence': round(confidence, 1),
            'log_prediction': log_prediction
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)