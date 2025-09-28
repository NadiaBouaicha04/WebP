import React, { useState } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/achat.css";

// Exemple de données de biens à acheter
const biensAcheter = [
  { 
    id: 1, type: "Appartement", titre: "Appartement centre-ville", prix: 120000,
    description: "Magnifique appartement en plein cœur du centre-ville.",
    chambres: 3, surface: "75 m²"
  },
  { 
    id: 2, type: "Maison", titre: "Maison avec jardin", prix: 250000,
    description: "Belle maison familiale avec grand jardin arboré.",
    chambres: 4, surface: "120 m²"
  },
  { 
    id: 3, type: "Appartement", titre: "Appartement moderne", prix: 180000,
    description: "Appartement neuf avec équipements haut de gamme.",
    chambres: 2, surface: "60 m²"
  },
  { 
    id: 4, type: "Maison", titre: "Maison de campagne", prix: 200000,
    description: "Maison de campagne rénovée avec charme.",
    chambres: 3, surface: "95 m²"
  },
];

export default function Acheter() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [filterType, setFilterType] = useState("Tous");
  const [showSignInModal, setShowSignInModal] = useState(false);

  const filteredBiens = biensAcheter
    .filter(bien => (filterType === "Tous" ? true : bien.type === filterType))
    .filter(bien => bien.titre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "asc") return a.prix - b.prix;
      if (sortOrder === "desc") return b.prix - a.prix;
      return 0;
    });

  const openModal = () => setShowSignInModal(true);
  const closeModal = () => setShowSignInModal(false);

  const handleVoirBien = (bienId) => {
    // Ici tu peux vérifier si l'utilisateur est connecté
    // Si non, ouvrir la modal
    openModal();
  };

  return (
    <>
      <Navbar />
      <div className="vendre-container">
        <h2>Acheter un bien</h2>

        <div className="filters-container">
          <input
            type="text"
            placeholder="Rechercher un bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="Tous">Tous les types</option>
            <option value="Appartement">Appartements</option>
            <option value="Maison">Maisons</option>
          </select>

          <select
            value={sortOrder || ""}
            onChange={(e) => setSortOrder(e.target.value || null)}
            className="filter-select"
          >
            <option value="">Trier par</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        <ul className="biens-list">
          {filteredBiens.map(bien => (
            <li key={bien.id} className="bien-card">
              <div className="bien-content">
                <h3>{bien.titre}</h3>
                <p className="bien-type">Type : {bien.type}</p>
                <div className="bien-details">
                  <span className="bien-chambres">{bien.chambres} chambres</span>
                  <span className="bien-surface">{bien.surface}</span>
                </div>
                <p className="bien-description">{bien.description}</p>
                <p className="bien-price">Prix : {bien.prix.toLocaleString()} €</p>
                <button className="bien-link" onClick={() => handleVoirBien(bien.id)}>Voir le bien</button>
              </div>
            </li>
          ))}
          {filteredBiens.length === 0 && <p className="no-bien">Aucun bien trouvé.</p>}
        </ul>
      </div>

      {/* Modal de connexion */}
      {showSignInModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Connexion requise</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Vous devez être connecté pour voir les détails de ce bien.</p>
              <div className="modal-buttons">
                <button className="btn-signin" onClick={() => window.location.href = '/signin'}>
                  Se connecter
                </button>
                <button className="btn-cancel" onClick={closeModal}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
