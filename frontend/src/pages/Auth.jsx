import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ton fichier api.js
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fonction pour gérer la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login
        const res = await api.post("/login", { email, password });
        localStorage.setItem("token", res.data.access_token);
        setMessage("Connexion réussie !");
        navigate("/"); // redirige vers Home
      } else {
        // Inscription
        const res = await api.post("/register", { name, email, password });
        setMessage(res.data.msg);
        setIsLogin(true); // bascule vers login après inscription
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || "Erreur, réessayez !");
    }
  };

  return (
    <>
      <Navbar />

      <div className="signup-body">
        <div className={`signup-container ${!isLogin ? "right-panel-active" : ""}`}>

          {/* Sign In Form */}
          <div className="signup-form-container signup-sign-in-container">
            <form className="signup-form" onSubmit={handleSubmit}>
              <h1 className="signup-h1">Se connecter</h1>
              <input
                className="signup-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="signup-input"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button className="signup-button">Se connecter</button>
              {message && <p style={{ marginTop: "10px", color: "red" }}>{message}</p>}
            </form>
          </div>

          {/* Sign Up Form */}
          <div className="signup-form-container signup-sign-up-container">
            <form className="signup-form" onSubmit={handleSubmit}>
              <h1 className="signup-h1">S'inscrire</h1>
              <input
                className="signup-input"
                type="text"
                placeholder="Nom complet"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                className="signup-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="signup-input"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button className="signup-button">S'inscrire</button>
              {message && <p style={{ marginTop: "10px", color: "red" }}>{message}</p>}
            </form>
          </div>

          {/* Overlay Panel */}
          <div className="signup-overlay-container">
            <div className="signup-overlay">
              <div className="signup-overlay-panel signup-overlay-left">
                <h1>Bienvenue!</h1>
                <p>Pour rester connecté, veuillez vous connecter avec vos informations personnelles</p>
                <button className="signbtn" onClick={() => setIsLogin(true)}>Se connecter</button>
              </div>

              <div className="signup-overlay-panel signup-overlay-right">
                <h1>Bonjour, Ami!</h1>
                <p>Entrez vos informations personnelles et commencez votre aventure avec nous</p>
                <button className="signbtn" onClick={() => setIsLogin(false)}>S'inscrire</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
