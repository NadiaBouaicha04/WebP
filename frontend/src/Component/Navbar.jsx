import "../assets/Styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "../services/auth";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setUser(authService.getUser());
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
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

        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-greeting">
              👋 {user?.name}
              {user?.role === 'admin' && ' 👑'}
            </span>
            <Link to="/profile" className="btn-profile">Profil</Link>
            <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
          </div>
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