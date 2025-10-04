import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import authService from "../services/auth";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await api.post("/auth/login", { 
        email, 
        password 
      });
      
      // Utiliser le service d'authentification
      authService.setAuth(res.data.token, res.data.user);
      
      setMessage("Connexion réussie ! Redirection...");
      
      // Redirection selon le rôle
      setTimeout(() => {
        if (res.data.user.role === "admin") {
          window.location.href = "http://localhost:5000/admin";
        } else {
          navigate("/");
          window.location.reload();
        }
      }, 1000);
      
    } catch (err) {
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
          <div className="signup-form-container signup-sign-in-container">
            <form className="signup-form" onSubmit={handleSubmit}>
              <h1 className="signup-h1">Se connecter</h1>
              
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
                <p style={{ 
                  marginTop: "10px", 
                  color: message.includes("réussie") ? "green" : "red",
                  textAlign: "center"
                }}>
                  {message}
                </p>
              )}

              <div style={{ 
                marginTop: "15px", 
                padding: "10px", 
                backgroundColor: "#f5f5f5", 
                borderRadius: "5px",
                fontSize: "12px",
                color: "#666",
                textAlign: "center"
              }}>
                <strong>Comptes de test:</strong><br/>
                • Admin: admin@example.com / admin123<br/>
                • User: test@example.com / password123
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}