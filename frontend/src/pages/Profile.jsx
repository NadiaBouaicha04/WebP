import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import api from "../api";
import "../assets/Styles/Profile.css"; // CSS mis à jour

// ✅ On importe l'image depuis src/assets
import profilImage from "../assets/Images/pro.png";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
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
        console.log(
          "Erreur lors du fetch profil :",
          err.response?.data || err.message
        );
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) return <p>Chargement...</p>;

  return (
    <>
      <Navbar />
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      
      <div className="spacer"></div> {/* ✅ meilleur que plein de <br> */}
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-left">
            <img
              className="profile-avatar"
              src={profilImage} // ✅ image importée correctement
              alt="Avatar"
            />
            <h3>{user.name}</h3>
            <div className="contact-info">
              <p>📞 {user.phone}</p>
              <p>✉️ {user.email}</p>
              <p>📍 {user.city}</p>
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
            <button className="download-cv">Consulter Favoris</button>
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
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <Footer />
    </>
  );
}
