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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        const API_URLS = [
          'http://127.0.0.1:5000/api/biens',
          'http://127.0.0.1:5000/api/api/properties',
          'http://127.0.0.1:5000/api/properties',
          'http://127.0.0.1:5000/api/simple/properties'
        ];
        
        let properties = [];
        
        for (const API_URL of API_URLS) {
          try {
            const response = await fetch(API_URL);
            
            if (!response.ok) continue;
            
            const data = await response.json();
            
            if (data.biens && Array.isArray(data.biens)) {
              properties = data.biens;
              break;
            } else if (data.properties && Array.isArray(data.properties)) {
              properties = data.properties;
              break;
            } else if (Array.isArray(data)) {
              properties = data;
              break;
            }
          } catch (err) {
            continue;
          }
        }
        
        if (properties.length > 0) {
          setBiensAcheter(properties);
          setError(null);
        } else {
          throw new Error('Impossible de charger les biens');
        }
        
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredBiens = biensAcheter
    .filter(bien => (filterType === "Tous" ? true : bien.type === filterType))
    .filter(bien => bien.titre && bien.titre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const prixA = typeof a.prix === 'string' ? parseFloat(a.prix) : a.prix;
      const prixB = typeof b.prix === 'string' ? parseFloat(b.prix) : b.prix;
      
      if (sortOrder === "asc") return prixA - prixB;
      if (sortOrder === "desc") return prixB - prixA;
      return 0;
    });

  const openModal = () => setShowSignInModal(true);
  const closeModal = () => setShowSignInModal(false);

  const handleVoirBien = (bienId) => {
    openModal();
  };

  const getPropertyImage = (bien) => {
    if (bien.images && bien.images.length > 0) {
      return bien.images[0];
    }
    return "/default-property.jpg";
  };

  const formatPrix = (prix) => {
    if (typeof prix === 'string') {
      return parseFloat(prix).toLocaleString();
    }
    return prix.toLocaleString();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="vendre-container">
          <h2>Acheter un bien</h2>
          <div className="loading-container">
            <div className="loading-spinner">Chargement des biens...</div>
          </div>
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
            <div className="error-message">❌ {error}</div>
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
            <option value="Studio">Studios</option>
            <option value="Villa">Villas</option>
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

        <div className="biens-stats">
          <p>{filteredBiens.length} bien(s) trouvé(s)</p>
        </div>

        <ul className="biens-list">
          {filteredBiens.map(bien => (
            <li key={bien.id} className="bien-card">
              <div className="bien-image">
                <img 
                  src={getPropertyImage(bien)} 
                  alt={bien.titre}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const placeholder = e.target.parentNode.querySelector('.bien-image-placeholder');
                    if (placeholder) placeholder.style.display = 'block';
                  }}
                />
                <div className="bien-image-placeholder" style={{display: 'none'}}>
                  🏠
                </div>
              </div>
              
              <div className="bien-content">
                <h3>{bien.titre}</h3>
                <p className="bien-type">Type : {bien.type}</p>
                <p className="bien-location">
                  📍 {bien.ville} 
                  {bien.adresse && ` - ${bien.adresse}`}
                </p>
                
                <div className="bien-details">
                  <span className="bien-chambres">{bien.chambres} chambre{bien.chambres > 1 ? 's' : ''}</span>
                  <span className="bien-surface">{bien.surface} m²</span>
                  {bien.salles_de_bain > 0 && (
                    <span className="bien-sdb">{bien.salles_de_bain} SDB</span>
                  )}
                </div>
                
                <p className="bien-description">
                  {bien.description && bien.description.length > 100 
                    ? `${bien.description.substring(0, 100)}...` 
                    : bien.description
                  }
                </p>
                
                <p className="bien-price">💰 {formatPrix(bien.prix)} €</p>
                
                <button 
                  className="bien-link" 
                  onClick={() => handleVoirBien(bien.id)}
                >
                  Voir le bien
                </button>
              </div>
            </li>
          ))}
          
          {filteredBiens.length === 0 && (
            <li className="no-bien">
              {search 
                ? `Aucun bien trouvé pour "${search}"` 
                : "Aucun bien disponible pour le moment"
              }
            </li>
          )}
        </ul>
      </div>

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
                <button className="btn-signin" onClick={() => window.location.href = '/login'}>
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