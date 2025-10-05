import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import authService from "../services/auth";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/Auth.css";
import { useAuth } from "../Contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      console.log("🔐 Début de la connexion...", { email });
      
      const res = await api.post("/auth/login", { 
        email, 
        password 
      });
      
      console.log("✅ Réponse API reçue - Status:", res.status);

      if (res.status === 200 && res.data.token && res.data.user) {
        console.log("🔐 Connexion réussie détectée");
        console.log("🎭 Rôle:", res.data.user.role);
        
        // 1. Stocker dans le localStorage via authService
        authService.setAuth(res.data.token, res.data.user);
        
        // 2. METTRE À JOUR LE CONTEXTE GLOBAL
        console.log("🔄 Mise à jour du contexte Auth...");
        login(res.data.user);
        
        setMessage("Connexion réussie ! Redirection...");
        
        console.log("⏱️ Lancement du timer de redirection (1s)...");
        
        // REDIRECTION : Admins vers Flask, Users vers React
        setTimeout(() => {
          console.log("🔄 EXÉCUTION DE LA REDIRECTION - Timer déclenché");
          console.log("🎭 Rôle détecté:", res.data.user.role);
          
          if (res.data.user.role === "admin") {
            console.log("🎯 Redirection ADMIN vers Flask");
            const fullUrl = `http://localhost:5000/admin/dashboard?token=${res.data.token}`;
            console.log("🌐 URL de redirection:", fullUrl);
            window.location.href = fullUrl;
          } else {
            console.log("🎯 Redirection USER vers React");
            navigate("/", { replace: true });
          }
        }, 1000);
        
      } else {
        console.log("❌ Échec de la connexion - Structure de données incorrecte");
        setMessage("Erreur: Structure de réponse inattendue");
      }
      
    } catch (err) {
      console.error("💥 Erreur complète lors de la connexion:");
      console.error("Message:", err.message);
      console.error("Réponse:", err.response?.data);
      
      setMessage(
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message ||
        "Erreur de connexion, vérifiez vos identifiants"
      );
    } finally {
      console.log("🏁 Finalisation du processus de connexion");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-body">
        <div className="signup-container">
          <div className="signup-form-container">
            <form className="signup-form" onSubmit={handleSubmit}>
              <h1>Se connecter</h1>
              
              <input
                className="signup-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <input
                className="signup-input"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              
              <button 
                className="signup-button" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              
              {message && (
                <div className={message.includes("réussie") ? "success-message" : "error-message"}>
                  {message}
                </div>
              )}

              {/* Section informations de test (optionnelle) */}
              <div style={{ 
                marginTop: "20px", 
                padding: "15px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "10px",
                fontSize: "13px",
                color: "#6c757d",
                textAlign: "center",
                border: "1px solid #e9ecef"
              }}>
                
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}