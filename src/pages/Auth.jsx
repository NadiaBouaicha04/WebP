import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      navigate("/"); // Redirige après login
    } else {
      navigate("/"); // Redirige après inscription
    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Auth Form */}
      <div className={`signup-body`}>
        <div className={`signup-container ${!isLogin ? "right-panel-active" : ""}`}>

          {/* Sign In Form */}
          <div className="signup-form-container signup-sign-in-container">
            <form className="signup-form" onSubmit={handleSubmit}>
              <h1 className="signup-h1">Se connecter</h1>
              <input className="signup-input" type="email" placeholder="Email" required />
              <input className="signup-input" type="password" placeholder="Mot de passe" required />
              <button className="signup-button">Se connecter</button>
            </form>
          </div>

          {/* Sign Up Form */}
          <div className="signup-form-container signup-sign-up-container">
            <form className="signup-form" onSubmit={handleSubmit}>
              <h1 className="signup-h1">S'inscrire</h1>
              <input className="signup-input" type="text" placeholder="Nom complet" required />
              <input className="signup-input" type="email" placeholder="Email" required />
              <input className="signup-input" type="password" placeholder="Mot de passe" required />
              <button className="signup-button">S'inscrire</button>
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

      {/* Footer */}
      <Footer />
    </>
  );
}
