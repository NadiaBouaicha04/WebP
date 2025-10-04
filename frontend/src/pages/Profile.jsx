import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import api from "../api";
import authService from "../services/auth";
import "../assets/Styles/Profile.css";
import profilImage from "../assets/Images/pro.png";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = authService.getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.log("Erreur lors du fetch profil :", err.response?.data || err.message);
        authService.clearAuth();
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/");
  };

  if (!user) return (
    <>
      <Navbar />
      <div className="spacer"></div>
      <div className="loading-profile">Chargement du profil...</div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="spacer"></div>
      
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-left">
            <img
              className="profile-avatar"
              src={profilImage}
              alt="Avatar"
            />
            <h3>{user.name}</h3>
            <div className="contact-info">
              <p>📞 {user.phone}</p>
              <p>✉️ {user.email}</p>
              <p>📍 {user.city}</p>
              <p className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
              </p>
            </div>
          </div>

          <div className="profile-right">
            <h2>
              Hello, <span>{user.name}!</span>
            </h2>
            <p>
              {user.bio ||
                "Bienvenue sur votre espace personnel. Ici, vous pouvez gérer vos annonces immobilières, consulter vos favoris et suivre vos demandes."}
            </p>
            
            <div className="profile-actions">
              <button className="download-cv">Consulter Favoris</button>
              <button onClick={handleLogout} className="logout-btn-profile">
                Se déconnecter
              </button>
            </div>

            <div className="social-icons">
              <a href={user.facebook}>
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href={user.twitter}>
                <i className="fab fa-twitter"></i>
              </a>
              <a href={user.instagram}>
                <i className="fab fa-instagram"></i>
              </a>
              <a href={user.linkedin}>
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="spacer"></div>
      <Footer />
    </>
  );
}