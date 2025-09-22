import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token); // <- ton backend renvoie { token }
    setMessage("Connexion réussie !");
    navigate("/"); // redirige vers Home
  } catch (err) {
    setMessage(err.response?.data?.msg || "Erreur, réessayez !");
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
              />
              <input
                className="signup-input"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="signup-button">Se connecter</button>
              {message && (
                <p style={{ marginTop: "10px", color: "red" }}>{message}</p>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
