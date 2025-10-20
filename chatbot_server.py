from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import ollama
import os
from datetime import datetime
import time
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)
CORS(app)

# Charger les données Excel
def load_real_estate_data():
    """Charge et prépare les données immobilières"""
    try:
        df = pd.read_excel("Full Combined Cleaned Data.xlsx")
        
        # Nettoyage des données
        df['Governorate'] = df['Governorate'].str.strip().replace({
            'La Manouba': 'Manouba',
            'Tunis ': 'Tunis'
        })
        
        # Supprimer les prix aberrants
        df = df[(df['Price (TND)'] > 0) & (df['Price (TND)'] < 1e7)]
        
        print(f"✅ Données chargées: {len(df)} propriétés, {df['Governorate'].nunique()} gouvernorats")
        return df
    except Exception as e:
        print(f"❌ Erreur chargement données: {e}")
        return None

# Initialiser les données
real_estate_df = load_real_estate_data()

class RealEstateChatbot:
    def __init__(self):
        self.df = real_estate_df
        self.system_prompt = self.create_system_prompt()
        self.vectorizer = TfidfVectorizer(stop_words=['french'])
        self.knowledge_base = self.create_knowledge_base()
        self.setup_rag_system()
        
    def create_system_prompt(self):
        """Crée le prompt système basé sur les données réelles"""
        if self.df is None:
            return "Tu es un expert immobilier spécialisé sur le marché tunisien."
        
        # Statistiques générales
        total_properties = len(self.df)
        avg_price = self.df['Price (TND)'].mean()
        avg_area = self.df['Area (m²)'].mean() if 'Area (m²)' in self.df.columns else None
        avg_rooms = self.df['Rooms'].mean() if 'Rooms' in self.df.columns else None
        
        # Statistiques par gouvernorat
        gov_stats = self.df.groupby('Governorate')['Price (TND)'].agg(['mean', 'count']).round(0)
        gov_stats = gov_stats.sort_values('mean', ascending=False)
        
        # Top catégories
        category_info = ""
        if 'Category' in self.df.columns:
            category_stats = self.df['Category'].value_counts()
            category_list = []
            for cat, count in category_stats.head().items():
                category_list.append(f"{cat}: {count} propriétés")
            category_info = f"🏠 TYPES DE BIENS :\n        - " + "\n        - ".join(category_list)
        
        prompt = f"""
        Tu es un expert immobilier spécialisé sur le marché tunisien. 
        Tu as accès à une base de données de {total_properties} propriétés.

        RÈGLES IMPORTANTES :
        1. Réponds UNIQUEMENT aux questions liées à l'immobilier en Tunisie
        2. Utilise les données statistiques fournies
        3. Sois précis et factuel dans tes réponses
        4. Pour les estimations de prix, donne des fourchettes réalistes
        5. Mentionne les spécificités régionales quand c'est pertinent
        6. Réponds en français de manière professionnelle
        7. Formate tes réponses de manière claire avec des émojis pertinents
        8. Sois concis - maximum 3-4 phrases

        Exemple de réponse type :
        "🏠 À Tunis, le prix moyen est de 588,000 TND. 
        Pour un appartement de 3 pièces, je recommande un budget entre 400,000 et 700,000 TND."
        """
        
        return prompt
    
    def create_knowledge_base(self):
        """Crée une base de connaissances structurée pour le RAG"""
        if self.df is None:
            return []
        
        knowledge_base = []
        
        # Statistiques par gouvernorat
        gov_stats = self.df.groupby('Governorate')['Price (TND)'].agg(['mean', 'count', 'min', 'max']).round(0)
        
        for governorate, stats in gov_stats.iterrows():
            knowledge_base.append({
                'type': 'governorate_stats',
                'content': f"Gouvernorat: {governorate}, Prix moyen: {stats['mean']:,.0f} TND, Fourchette: {stats['min']:,.0f}-{stats['max']:,.0f} TND, Nombre de propriétés: {stats['count']}",
                'keywords': [governorate.lower(), 'prix', 'moyen', 'statistiques']
            })
        
        # Statistiques générales
        general_stats = {
            'total_properties': len(self.df),
            'avg_price': self.df['Price (TND)'].mean(),
            'avg_area': self.df['Area (m²)'].mean() if 'Area (m²)' in self.df.columns else None,
            'avg_rooms': self.df['Rooms'].mean() if 'Rooms' in self.df.columns else None
        }
        
        knowledge_base.append({
            'type': 'general_stats',
            'content': f"Statistiques générales: {general_stats['total_properties']} propriétés, Prix moyen: {general_stats['avg_price']:,.0f} TND, Surface moyenne: {general_stats['avg_area']:.0f} m², Pièces moyennes: {general_stats['avg_rooms']:.1f}",
            'keywords': ['général', 'moyenne', 'total', 'statistiques', 'global']
        })
        
        return knowledge_base
    
    def setup_rag_system(self):
        """Initialise le système RAG"""
        if not self.knowledge_base:
            return
            
        documents = [item['content'] for item in self.knowledge_base]
        self.document_vectors = self.vectorizer.fit_transform(documents)
    
    def retrieve_relevant_context(self, question, top_k=3):
        """Récupère le contexte pertinent avec RAG"""
        if not hasattr(self, 'document_vectors'):
            return ""
            
        question_vector = self.vectorizer.transform([question.lower()])
        similarities = cosine_similarity(question_vector, self.document_vectors)
        
        # Obtenir les top_k documents les plus similaires
        top_indices = similarities[0].argsort()[-top_k:][::-1]
        
        context = "📊 CONTEXTE PERTINENT RÉCUPÉRÉ :\n"
        for idx in top_indices:
            if similarities[0][idx] > 0.1:  # Seuil de similarité
                context += f"- {self.knowledge_base[idx]['content']}\n"
        
        return context if context != "📊 CONTEXTE PERTINENT RÉCUPÉRÉ :\n" else ""
    
    def get_quick_generic_response(self, question):
        """Réponses génériques uniquement pour les questions très simples"""
        question_lower = question.lower().strip()
        
        # Liste limitée de réponses génériques pour questions basiques
        generic_responses = {
            'bonjour': "👋 Bonjour ! Je suis votre expert immobilier intelligent. Posez-moi vos questions sur le marché tunisien !",
            'salut': "👋 Salut ! Prêt à analyser le marché immobilier avec vous. Quelle est votre question ?",
            'hello': "👋 Hello ! Expert immobilier Tunisie à votre service. Comment puis-je vous aider ?",
            'coucou': "👋 Coucou ! Enchanté de discuter immobilier avec vous. Que souhaitez-vous savoir ?",
            'merci': "👍 De rien ! N'hésitez pas si vous avez d'autres questions sur l'immobilier.",
            'au revoir': "👋 À bientôt ! N'hésitez pas à revenir pour des conseils immobiliers.",
        }
        
        # Correspondance exacte pour les salutations simples
        for key, response in generic_responses.items():
            if key == question_lower:
                return response
        
        # Correspondance partielle uniquement pour les salutations
        if any(word in question_lower for word in ['bonjour', 'salut', 'hello', 'coucou', 'hi ']) and len(question_lower) < 20:
            return generic_responses['bonjour']
            
        return None
    
    def generate_llm_response(self, question, context):
        """Génère une réponse intelligente avec Mistral"""
        try:
            start_time = time.time()
            
            prompt = f"""
            QUESTION: {question}
            
            {context}
            
            Donne une réponse concise et pertinente basée sur le contexte ci-dessus.
            Réponds en 2-4 phrases maximum. Sois précis avec les chiffres.
            """
            
            response = ollama.chat(
                model='mistral',
                messages=[
                    {'role': 'system', 'content': self.system_prompt},
                    {'role': 'user', 'content': prompt}
                ],
                options={
                    'num_predict': 150,  # Limite raisonnable
                    'temperature': 0.3,
                    'top_k': 40,
                }
            )
            
            end_time = time.time()
            print(f"🧠 Mistral processing: {(end_time - start_time):.2f}s")
            
            return response['message']['content']
            
        except Exception as e:
            print(f"❌ LLM Error: {e}")
            # Fallback intelligent basé sur le contexte RAG
            if context:
                return f"🏠 Basé sur nos données: {context.split(' - ')[-1] if ' - ' in context else 'Consultez notre outil de prédiction pour une analyse précise.'}"
            return "💡 Je recommande d'utiliser notre outil de prédiction pour une estimation détaillée basée sur vos critères spécifiques."
    
    def generate_response(self, question):
        """Génère une réponse optimisée avec RAG + Mistral"""
        if not question.strip():
            return "🤔 Pouvez-vous préciser votre question sur l'immobilier tunisien ?"
        
        start_time = time.time()
        
        # Étape 1: Vérifier les réponses génériques (seulement pour salutations)
        generic_response = self.get_quick_generic_response(question)
        if generic_response:
            print("⚡ Réponse générique instantanée")
            return generic_response
        
        # Étape 2: Récupération du contexte avec RAG
        rag_context = self.retrieve_relevant_context(question)
        
        # Étape 3: Génération avec Mistral
        response = self.generate_llm_response(question, rag_context)
        
        end_time = time.time()
        print(f"⏱️  Total response time: {(end_time - start_time):.2f}s")
        
        return response

# Initialisation du chatbot
chatbot = RealEstateChatbot()

# Routes du chatbot
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'Question requise'}), 400
        
        start_time = time.time()
        response = chatbot.generate_response(question)
        end_time = time.time()
        
        print(f"📨 '{question}' → ⏱️ {(end_time - start_time):.3f}s")
        
        return jsonify({
            'question': question,
            'response': response,
            'response_time': round(end_time - start_time, 3),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/supported_questions', methods=['GET'])
def supported_questions():
    """Liste des types de questions supportées"""
    return jsonify({
        'question_types': [
            "Prix par gouvernorat (ex: 'prix à Tunis')",
            "Comparaisons régionales", 
            "Conseils d'investissement",
            "Tendances du marché",
            "Estimations de propriétés",
            "Analyse par type de bien"
        ],
        'quick_responses': [
            "Salutations simples (bonjour, salut, etc.)"
        ]
    })

@app.route('/market_stats', methods=['GET'])
def market_stats():
    """Endpoint pour obtenir des statistiques générales du marché"""
    try:
        if real_estate_df is None:
            return jsonify({'error': 'Données non disponibles'}), 400
        
        stats = {
            'total_properties': len(real_estate_df),
            'avg_price': real_estate_df['Price (TND)'].mean(),
            'min_price': real_estate_df['Price (TND)'].min(),
            'max_price': real_estate_df['Price (TND)'].max(),
            'governorates_count': real_estate_df['Governorate'].nunique(),
            'top_governorates': real_estate_df['Governorate'].value_counts().head(5).to_dict()
        }
        
        if 'Area (m²)' in real_estate_df.columns:
            stats['avg_area'] = real_estate_df['Area (m²)'].mean()
        
        if 'Rooms' in real_estate_df.columns:
            stats['avg_rooms'] = real_estate_df['Rooms'].mean()
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé de l'API"""
    return jsonify({
        'status': 'healthy',
        'service': 'real_estate_chatbot',
        'data_loaded': real_estate_df is not None,
        'rag_enabled': True,
        'llm_enabled': True,
        'response_strategy': 'RAG + Mistral intelligent',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🧠 Serveur Chatbot Immobilier INTELLIGENT démarré sur http://localhost:5001")
    print("📊 Données chargées :", "✅" if real_estate_df is not None else "❌")
    if real_estate_df is not None:
        print(f"   - {len(real_estate_df)} propriétés analysées")
        print(f"   - {real_estate_df['Governorate'].nunique()} gouvernorats")
    print(f"🔍 Base de connaissances: {len(chatbot.knowledge_base)} documents RAG")
    print("🤖 Stratégie: RAG contextuel + Mistral pour réponses intelligentes")
    print("💬 Prêt pour des conversations immobilières intelligentes...")
    app.run(debug=True, port=5001)