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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Chargement du profil utilisateur...");
      
      // Récupérer les données depuis le localStorage
      const authData = authService.getAuth();
      console.log("📦 Données d'authentification:", authData);
      
      if (!authData.token || !authData.user) {
        console.log("❌ Utilisateur non connecté - redirection vers login");
        setError("Vous devez être connecté pour accéder à cette page");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        console.log("✅ Utilisateur connecté détecté");
        
        // Utiliser les données du localStorage avec des valeurs par défaut
        const userData = {
          ...authData.user,
          name: authData.user.name || authData.user.email?.split('@')[0] || "Utilisateur",
          phone: authData.user.phone || "Non renseigné",
          city: authData.user.city || "Non renseignée",
          bio: authData.user.bio || "Bienvenue sur votre espace personnel. Ici, vous pouvez gérer vos annonces immobilières, consulter vos favoris et suivre vos demandes.",
          facebook: "#",
          twitter: "#", 
          instagram: "#",
          linkedin: "#"
        };
        
        console.log("👤 Données utilisateur préparées:", userData);
        setUser(userData);
        
      } catch (error) {
        console.error("💥 Erreur lors du chargement du profil:", error);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    console.log("🚪 Déconnexion de l'utilisateur");
    authService.clearAuth();
    navigate("/");
  };

  const handleViewFavorites = () => {
    console.log("❤️ Navigation vers les favoris");
    // Redirection vers la page des favoris (à créer)
    alert("Fonctionnalité 'Favoris' à implémenter");
  };

  const handleEditProfile = () => {
    console.log("✏️ Édition du profil");
    // Redirection vers l'édition du profil (à créer)
    alert("Fonctionnalité 'Édition du profil' à implémenter");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="spacer"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de votre profil...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="spacer"></div>
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Erreur</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate("/login")} className="btn-primary">
              Se connecter
            </button>
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="spacer"></div>
        <div className="error-container">
          <div className="error-icon">😕</div>
          <h3>Profil non disponible</h3>
          <p>Impossible de charger les informations du profil</p>
          <button onClick={() => navigate("/login")} className="btn-primary">
            Se connecter
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="spacer"></div>
      
      <div className="profile-page">
        <div className="profile-header">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et vos préférences</p>
        </div>

        <div className="profile-card">
          <div className="profile-left">
            <div className="avatar-section">
              <img
                className="profile-avatar"
                src={profilImage}
                alt="Avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="avatar-placeholder" style={{display: 'none'}}>
                👤
              </div>
              <button onClick={handleEditProfile} className="edit-avatar-btn">
                ✏️ Changer la photo
              </button>
            </div>
            
            <h3 className="user-name">{user.name}</h3>
            
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span className="contact-text">{user.email}</span>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">{user.phone}</span>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span className="contact-text">{user.city}</span>
              </div>
              
              <div className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? (
                  <>
                    <span className="badge-icon">👑</span>
                    <span className="badge-text">Administrateur</span>
                  </>
                ) : (
                  <>
                    <span className="badge-icon">👤</span>
                    <span className="badge-text">Utilisateur</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="profile-right">
            <div className="welcome-section">
              <h2>
                Bonjour, <span className="highlight">{user.name}</span> !
              </h2>
              <p className="user-bio">{user.bio}</p>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Annonces</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Favoris</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Visites</div>
              </div>
            </div>

            <div className="profile-actions">
              <button onClick={handleViewFavorites} className="btn-favorites">
                <span className="btn-icon">❤️</span>
                Mes Favoris
              </button>
              
              <button onClick={handleEditProfile} className="btn-edit">
                <span className="btn-icon">✏️</span>
                Modifier le Profil
              </button>
              
              {user.role === 'admin' && (
                <button 
                  onClick={() => window.location.href = 'http://localhost:5000/admin/dashboard'} 
                  className="btn-admin"
                >
                  <span className="btn-icon">👑</span>
                  Dashboard Admin
                </button>
              )}
              
              <button onClick={handleLogout} className="btn-logout">
                <span className="btn-icon">🚪</span>
                Se déconnecter
              </button>
            </div>

            <div className="social-section">
              <h4>Réseaux sociaux</h4>
              <div className="social-icons">
                <a href={user.facebook} className="social-link" title="Facebook">
                  <span className="social-icon">📘</span>
                </a>
                <a href={user.twitter} className="social-link" title="Twitter">
                  <span className="social-icon">🐦</span>
                </a>
                <a href={user.instagram} className="social-link" title="Instagram">
                  <span className="social-icon">📷</span>
                </a>
                <a href={user.linkedin} className="social-link" title="LinkedIn">
                  <span className="social-icon">💼</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section des annonces récentes (à implémenter) */}
        <div className="recent-activity">
          <h3>Activité Récente</h3>
          <div className="activity-placeholder">
            <p>Aucune activité récente</p>
            <button onClick={() => navigate("/acheter")} className="btn-explore">
              🏠 Explorer les biens
            </button>
          </div>
        </div>
      </div>
      
      <div className="spacer"></div>
      <Footer />
    </>
  );
}