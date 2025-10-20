import React, { useState, useEffect } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/achat.css";

export default function Acheter() {
  const [biensAcheter, setBiensAcheter] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [filterType, setFilterType] = useState("Tous");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL backend
  const API_URL = "http://127.0.0.1:5000/api/properties";

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Impossible de récupérer les biens");

        const data = await response.json();

        if (data.success && Array.isArray(data.properties)) {
          setBiensAcheter(data.properties);
          setError(null);
        } else {
          throw new Error("Aucun bien disponible");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // URL complète de l'image - CORRIGÉ
  const getPropertyImageUrl = (filename) => {
    if (!filename) return "https://via.placeholder.com/300x200?text=Pas+d'image";
    
    // Si c'est déjà une URL complète, on la retourne telle quelle
    if (filename.startsWith('http')) return filename;
    
    // Si c'est un chemin relatif, on construit l'URL complète
    return `http://127.0.0.1:5000/uploads/properties/${filename}`;
  };

  const filteredBiens = biensAcheter
    .filter((bien) => (filterType === "Tous" ? true : bien.type === filterType))
    .filter((bien) => bien.titre && bien.titre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const prixA = typeof a.prix === "string" ? parseFloat(a.prix) : a.prix;
      const prixB = typeof b.prix === "string" ? parseFloat(b.prix) : b.prix;

      if (sortOrder === "asc") return prixA - prixB;
      if (sortOrder === "desc") return prixB - prixA;
      return 0;
    });

  const openModal = () => setShowSignInModal(true);
  const closeModal = () => setShowSignInModal(false);
  const handleVoirBien = (bienId) => openModal();

  const formatPrix = (prix) => {
    if (typeof prix === "string") return parseFloat(prix).toLocaleString();
    return prix.toLocaleString();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="vendre-container">
          <h2>Acheter un bien</h2>
          <div className="loading-container">Chargement des biens...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="vendre-container">
          <h2>Acheter un bien</h2>
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={() => window.location.reload()} className="retry-button">
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="vendre-container">
        <h2>Acheter un bien</h2>

        {/* Filtres */}
        <div className="filters-container">
          <input
            type="text"
            placeholder="Rechercher un bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="Tous">Tous les types</option>
            <option value="Appartement">Appartements</option>
            <option value="Maison">Maisons</option>
            <option value="Studio">Studios</option>
            <option value="Villa">Villas</option>
          </select>
          <select value={sortOrder || ""} onChange={(e) => setSortOrder(e.target.value || null)} className="filter-select">
            <option value="">Trier par</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        {/* Statistiques */}
        <div className="biens-stats">
          <p>{filteredBiens.length} bien(s) trouvé(s)</p>
        </div>

        {/* Liste des biens */}
        <ul className="biens-list">
          {filteredBiens.map((bien) => (
            <li key={bien.id} className="bien-card">

              {/* Galerie d'images - CORRIGÉ */}
              <div className="bien-images">
                {bien.images && bien.images.length > 0 ? (
                  // Afficher seulement la première image pour l'instant
                  <img
                    src={getPropertyImageUrl(bien.images[0])}
                    alt={bien.titre}
                    onError={(e) => { 
                      e.target.src = "https://via.placeholder.com/300x200?text=Pas+d'image";
                    }}
                    className="bien-image"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/300x200?text=Pas+d'image"
                    alt="Aucune image disponible"
                    className="bien-image"
                  />
                )}
              </div>

              {/* Contenu du bien */}
              <div className="bien-content">
                <h3>{bien.titre || "Sans titre"}</h3>
                <p>Type : {bien.type || "Non spécifié"}</p>
                <p>{bien.ville} {bien.adresse && `- ${bien.adresse}`}</p>
                <p>{bien.chambres} chambre(s), {bien.surface} m², {bien.salles_de_bain} SDB</p>
                <p>💰 {formatPrix(bien.prix)} Dt</p>
                <button onClick={() => handleVoirBien(bien.id)}>Voir le bien</button>
              </div>
            </li>
          ))}

          {filteredBiens.length === 0 && (
            <li className="no-bien">
              {search ? `Aucun bien trouvé pour "${search}"` : "Aucun bien disponible pour le moment"}
            </li>
          )}
        </ul>
      </div>

      {/* Modal */}
      {showSignInModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Connexion requise</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Vous devez être connecté pour voir les détails de ce bien.</p>
              <button onClick={() => (window.location.href = "/login")}>Se connecter</button>
              <button onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}