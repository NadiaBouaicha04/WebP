import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("Homme");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------
    // Vérifications côté frontend
    // -------------------
    if (!name || !email || !dob || !phone || !city || !gender || !password || !confirmPassword) {
      setMessage("❌ Tous les champs sont obligatoires !");
      return;
    }

    // Email valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("❌ Adresse email invalide !");
      return;
    }

    // Téléphone : exactement 8 chiffres
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setMessage("❌ Le numéro de téléphone doit contenir exactement 8 chiffres !");
      return;
    }

    // Date de naissance ne dépasse pas aujourd'hui
    const today = new Date();
    const birthDate = new Date(dob);
    if (birthDate > today) {
      setMessage("❌ La date de naissance ne peut pas dépasser aujourd'hui !");
      return;
    }

    // Vérification des mots de passe
    if (password !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas !");
      return;
    }

    // -------------------
    // Envoi au backend
    // -------------------
    try {
      await api.post("/auth/register", {
        name,
        email,
        dob,
        phone,
        city,
        gender,
        password,
        confirm_password: confirmPassword,
      });
      setMessage("✅ Inscription réussie !");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Erreur, réessayez !");
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-body">
        <div className="signup-container">
          <form className="signup-form" onSubmit={handleSubmit}>
            <h1>Créer un compte</h1>

            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Date de naissance</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Numéro de téléphone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Ville</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Genre</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <button type="submit" className="btn-register">S'inscrire</button>

            {message && (
              <p className={message.startsWith("✅") ? "success-message" : "error-message"}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
