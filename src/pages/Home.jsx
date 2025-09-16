import { useState } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer"; // Ajout du footer
import "../assets/Styles/Home.css";

export default function Home() {
  const [ville, setVille] = useState("");

  const biens = [
    { id: 1, nom: "Appartement cosy", ville: "Paris", surface: 45, prix: 300000 },
    { id: 2, nom: "Maison familiale", ville: "Lyon", surface: 120, prix: 450000 },
    { id: 3, nom: "Studio moderne", ville: "Paris", surface: 25, prix: 200000 },
    { id: 4, nom: "Villa avec jardin", ville: "Nice", surface: 150, prix: 750000 },
  ];

  const biensFiltres = biens.filter((bien) =>
    bien.ville.toLowerCase().includes(ville.toLowerCase())
  );

  return (
    <div className="home-container">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section" id="hero">
        <div className="hero-content">
          <h1>Votre futur bien vous attend</h1>
          <p>Trouvez, achetez ou louez un bien immobilier au meilleur prix</p>

          <input
            type="text"
            placeholder=" Entrez une ville..."
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="home-input"
          />
        </div>
      </div>

      {/* Services */}
      <section className="services-section" id="services">
        <h2>Nos Services</h2>
        <p className="services-subtitle">
          Nous vous offrons les meilleures solutions immobilières
        </p>

        <div className="services-cards">
          <div className="service-card">
            <h3> Acheter</h3>
            <p>Découvrez nos biens disponibles à l’achat au meilleur prix.</p>
            <a href="/acheter" className="service-btn">Voir les biens</a>
          </div>

          <div className="service-card">
            <h3> Vendre</h3>
            <p>Vendez votre maison rapidement et facilement avec ImmoPredict.</p>
            <a href="/vendre" className="service-btn">Mettre en vente</a>
          </div>

          <div className="service-card">
            <h3> Louer</h3>
            <p>Accédez aux meilleures offres de location dans votre ville.</p>
            <a href="/louer" className="service-btn">Voir les locations</a>
          </div>
        </div>
      </section>

{/* À propos de nous */}
<section className="about-us-section" id="aboutus">
  <div className="about-us-container">
    <div className="about-us-image">
      <img src="\src\assets\Images\1.jpg" alt="Notre agence immobilière" />
    </div>
    <div className="about-us-content">
      <h2>Qui sommes-nous ?</h2>
      <p>
        Chez <strong>ImmoPredict</strong>, nous croyons que l’immobilier doit être simple,
        transparent et accessible à tous. Depuis plus de 10 ans, nous accompagnons
        nos clients dans leurs projets d’achat, de vente et de location en leur
        offrant un service personnalisé et innovant basé sur la technologie et
        l’expertise humaine.
      </p>
      <p>
        Notre mission est d’aider chaque client à trouver le bien idéal tout en
        bénéficiant des meilleures conditions du marché. Rejoignez les centaines
        de familles et investisseurs qui nous font déjà confiance.
      </p>
    </div>
  </div>
</section>



   {/* Statistiques de l'agence */}
<section className="stats-section">
  <h2>Pourquoi choisir ImmoPredict ?</h2>
  <p className="stats-subtitle">
    Notre expertise fait la différence dans vos projets immobiliers
  </p>

  <div className="stats-cards">
    <div className="stat-card">
      <h3>10+</h3>
      <p>Années d’expérience</p>
    </div>
    <div className="stat-card highlight">
      <h3>500+</h3>
      <p>Biens vendus</p>
    </div>
    <div className="stat-card">
      <h3>300+</h3>
      <p>Clients satisfaits</p>
    </div>
    <div className="stat-card">
      <h3>50+</h3>
      <p>Experts à votre service</p>
    </div>
  </div>
</section>


 

      {/* Footer ajouté */}
      <Footer />
    </div>
  );
}
