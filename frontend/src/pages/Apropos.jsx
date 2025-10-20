import React from "react";
import Navbar from "../Component/Navbar.jsx";
import Footer from "../Component/Footer.jsx";
import "./../assets/Styles/Apropos.css";

const Apropos = () => {
  return (
    <>
      <Navbar />
      <div className="apropos-container">
        {/* Hero Section */}
        <div className="about-hero">
          <div className="about-hero-content">
            <h1>À propos de ImmoPredict</h1>
            <p className="hero-subtitle">
              L'innovation au service de votre projet immobilier
            </p>
          </div>
        </div>

        <div className="apropos-content">
          {/* Mission Section */}
          <section className="mission-section">
            <div className="mission-content">
              <h2>Notre Mission</h2>
              <div className="mission-text">
                <p>
                  Chez ImmoPredict, nous révolutionnons l'expérience immobilière en combinant 
                  l'intelligence artificielle de pointe avec une analyse approfondie du marché. 
                  Notre plateforme vous offre des estimations précises et personnalisées pour 
                  chaque bien immobilier.
                </p>
                <p>
                  Nous croyons que l'accès à des données fiables et à des prédictions précises 
                  devrait être à la portée de tous, quels que soient vos objectifs immobiliers.
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="values-section">
            <h2>Nos Valeurs</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🎯</div>
                <h3>Précision</h3>
                <p>
                  Des estimations immobilières fiables grâce à nos algorithmes 
                  d'IA constamment mis à jour avec les dernières données du marché.
                </p>
              </div>
              <div className="value-card">
                <div className="value-icon">⚡</div>
                <h3>Innovation</h3>
                <p>
                  Une technologie de pointe qui s'adapte en temps réel aux 
                  fluctuations du marché immobilier.
                </p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Transparence</h3>
                <p>
                  Des résultats clairs et détaillés, avec une explication 
                  complète de chaque estimation.
                </p>
              </div>
              <div className="value-card">
                <div className="value-icon">🔒</div>
                <h3>Sécurité</h3>
                <p>
                  Vos données sont protégées et traitées avec la plus grande 
                  confidentialité.
                </p>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="services-section">
            <h2>Nos Services</h2>
            <div className="services-grid">
              <div className="service-card">
                <h3>Estimation Intelligente</h3>
                <p>
                  Obtenez une estimation précise de votre bien en quelques clics, 
                  basée sur l'analyse de millions de données immobilières.
                </p>
              </div>
              <div className="service-card">
                <h3>Analyse de Marché</h3>
                <p>
                  Suivez l'évolution des prix et identifiez les tendances 
                  du marché immobilier en temps réel.
                </p>
              </div>
              <div className="service-card">
                <h3>Conseils Personnalisés</h3>
                <p>
                  Des recommandations adaptées à votre profil et à vos 
                  objectifs d'investissement.
                </p>
              </div>
            </div>
          </section>

          

          {/* CTA Section */}
          <section className="cta-section">
            <h2>Prêt à découvrir la valeur réelle de votre bien ?</h2>
            <p>
              Rejoignez des milliers d'utilisateurs qui font confiance à ImmoPredict 
              pour leurs projets immobiliers.
            </p>
            <div className="cta-buttons">
              <button className="cta-button primary">
                Commencer l'estimation
              </button>
              <button className="cta-button secondary">
                Découvrir nos outils
              </button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Apropos;