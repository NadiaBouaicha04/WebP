# routes/estimate.py
from flask import Blueprint, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os

def create_estimate_routes():
    estimate_bp = Blueprint("estimate", __name__)

    # Chemins vers les fichiers modèles
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/routes
    MODEL_PATH = os.path.join(BASE_DIR, "../models/immobilier_model_n.pkl")
    X_COLUMNS_PATH = os.path.join(BASE_DIR, "../models/x_columns.pkl")  # colonnes utilisées à l'entraînement

    # Charger le modèle et les colonnes
    xgb_model = joblib.load(MODEL_PATH)
    X_columns = joblib.load(X_COLUMNS_PATH)

    @estimate_bp.route("/estimate", methods=["POST"])
    def estimate():
        data = request.get_json()
        print("Données reçues:", data)
        try:
            # Conversion des types pour éviter les erreurs
            data['rooms'] = int(data['rooms'])
            data['area_m2'] = float(data['area_m2'])

            # Préparer les données d'entrée
            input_df = pd.DataFrame([data])

            # Encoder les colonnes catégorielles comme lors de l'entraînement
            input_encoded = pd.get_dummies(input_df)
            input_encoded = input_encoded.reindex(columns=X_columns, fill_value=0)

            # Prédiction
            log_pred = xgb_model.predict(input_encoded)  # retourne un array
            pred_price = np.exp(log_pred[0])  # récupérer la première valeur
            return jsonify({"prediction": f"{pred_price:,.2f} TND"})

        except Exception as e:
            print("Erreur lors de l'estimation:", str(e))
            return jsonify({"error": str(e)}), 400

    return estimate_bp
