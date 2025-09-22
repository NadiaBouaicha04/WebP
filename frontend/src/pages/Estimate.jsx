import { useState } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import api from "../api";
import "../assets/Styles/Estimate.css";

export default function Estimate() {
  const [form, setForm] = useState({
    category: "",
    governorate: "",
    area: "",
    source: "",
    rooms: "",
    area_m2: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setError(null);

    try {
      const res = await api.post("/estimate", form);
      if (res.data.prediction) {
        setPrediction(res.data.prediction);
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("Erreur inconnue lors de l'estimation.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'estimation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="estimate-page">
      <Navbar />
      <br></br>
      <br></br>
      <br></br>

      <h2 className="estimate-title">Estimation de votre bien</h2>

      <form onSubmit={handleSubmit} className="estimate-form">
        <label>Catégorie :</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">-- Sélectionner --</option>
          <option value="Appartement">Appartement</option>
          <option value="Maison">Maison</option>
          <option value="Villa">Villa</option>
        </select>

        <label>Gouvernorat :</label>
        <select name="governorate" value={form.governorate} onChange={handleChange} required>
          <option value="">-- Sélectionner --</option>
          <option value="Tunis">Tunis</option>
          <option value="Sfax">Sfax</option>
          <option value="Sousse">Sousse</option>
        </select>

        <label>Zone :</label>
        <input type="text" name="area" value={form.area} onChange={handleChange} placeholder="Ex: Centre-ville" required />

        <label>Source :</label>
        <select name="source" value={form.source} onChange={handleChange} required>
          <option value="">-- Sélectionner --</option>
          <option value="Immobilier.tn">Immobilier.tn</option>
          <option value="Tayara">Tayara</option>
          <option value="Autre">Autre</option>
        </select>

        <label>Nombre de pièces :</label>
        <input type="number" name="rooms" value={form.rooms} onChange={handleChange} min={1} required />

        <label>Surface (m²) :</label>
        <input type="number" name="area_m2" value={form.area_m2} onChange={handleChange} min={1} required />

        <button type="submit" className="estimate-btn" disabled={loading}>
          {loading ? "Estimation en cours..." : "Estimer"}
        </button>
      </form>

      {prediction && (
        <div className="prediction-result">
          <h3>Résultat :</h3>
          <p>{prediction}</p>
        </div>
      )}

      {error && (
        <div className="prediction-error">
          <h3>Erreur :</h3>
          <p>{error}</p>
        </div>
      )}

<br></br>
<br></br>
<br></br>
<br></br>
      <Footer />
    </div>
  );
}
