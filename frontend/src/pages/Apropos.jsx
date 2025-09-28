import React from "react";
import Navbar from "../Component/Navbar.jsx";
import Footer from "../Component/Footer.jsx";
import "./../assets/Styles/Apropos.css";

const Apropos = () => {
  return (
    <>
      <Navbar />
      <div className="apropos-container">
        <div className="apropos-content">
          <h1>À propos de notre site</h1>
          <div className="text-section">
            <p>
              Bienvenue sur notre plateforme de prédiction immobilière. 
              Nous combinons l'intelligence artificielle et les données du marché 
              pour vous offrir des estimations précises de la valeur des biens immobiliers.
            </p>
            <p>
              Notre mission est de rendre la recherche et l'achat immobilier 
              plus simples, rapides et fiables, grâce à des technologies modernes et accessibles.
            </p>
            <p>
              Que vous soyez acheteur, vendeur ou investisseur, notre outil vous accompagne 
              pour prendre des décisions éclairées et optimiser vos transactions immobilières.
            </p>
          </div>
          
          <div className="about-divider"></div>
          
          <div className="about-section">
            <h2>À PROPOS DE ImmoPredict</h2>
            <p>
              ImmoPredict vous aide à trouver la maison de vos rêves. Découvrez nos biens immobiliers 
              à vendre ou à louer, et bénéficiez de conseils personnalisés.
            </p>
          </div>
          
         
          
         
          
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Apropos;