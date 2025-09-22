import "../assets/Styles/Navbar.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">🏡 ImmoPredict</div>
      <ul className="navbar-links">
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/acheter">Acheter</Link></li>
        <li><Link to="/vendre">Vendre</Link></li>
        <li><Link to="/louer">Louer</Link></li>
        <li><Link to="/apropos">À propos</Link></li>
      </ul>

      <div className="navbar-actions">
        <Link to="/contact" className="btn-contact">Contact</Link>
        <Link to="/deposer" className="btn-deposer">Déposer une annonce</Link>

        {token ? (
          <>
            <Link to="/profile" className="btn-profile">Profil</Link>
            <button onClick={handleLogout} className="btn-logout">Se Déconnecter</button>
          </>
        ) : (
          <>
            <Link to="/register" className="btn-register">S'inscrire</Link>
            <Link to="/login" className="btn-login">Se Connecter</Link>
          </>
        )}
      </div>
    </nav>
  );
}
