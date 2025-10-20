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
    // EMPÊCHER le comportement par défaut du formulaire
    e.preventDefault();
    console.log("🔄 handleSubmit EXÉCUTÉ !");
    
    setLoading(true);
    setMessage("");
    
    try {
      console.log("🔐 Début de la connexion...", { email });
      
      // ✅ URL CORRECTE
      const res = await api.post("/auth/login", { 
        email, 
        password 
      });
      
      console.log("✅ Réponse API reçue:", res.data);

      if (res.data.token && res.data.user) {
        console.log("🔐 Connexion réussie");
        
        // Stocker l'authentification
        authService.setAuth(res.data.token, res.data.user);
        login(res.data.user);
        
        setMessage("Connexion réussie ! Redirection...");
        
        // Redirection
        setTimeout(() => {
          if (res.data.user.role === "admin") {
            window.location.href = `http://localhost:5000/admin/dashboard?token=${res.data.token}`;
          } else {
            navigate("/", { replace: true });
          }
        }, 1000);
        
      } else {
        setMessage("Erreur: Structure de réponse inattendue");
      }
      
    } catch (err) {
      console.error("💥 Erreur:", err);
      setMessage(
        err.response?.data?.error || 
        "Erreur de connexion, vérifiez vos identifiants"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-body">
        <div className="signup-container">
          <div className="signup-form-container">
            {/* ✅ FORMULAIRE AVEC PREVENT DEFAULT */}
            <form 
              className="signup-form" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
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
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}