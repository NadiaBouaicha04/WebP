import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import "../assets/Styles/Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">
      <Navbar />

      {/* Section Titre */}
      <section className="contact-header">
        <h1>Contactez-nous</h1>
        <p>
          Une question, un projet immobilier ou besoin d’un conseil ?  
          Nous sommes là pour vous accompagner.
        </p>
      </section>

      {/* Infos rapides */}
      <section className="contact-infos">
        <div className="info-card">
          <span>📧</span>
          <h3>Email</h3>
          <p>contact@immopredict.com</p>
        </div>
        <div className="info-card">
          <span>📞</span>
          <h3>Téléphone</h3>
          <p>+33 1 23 45 67 89</p>
        </div>
        <div className="info-card">
          <span>📍</span>
          <h3>Adresse</h3>
          <p>123 Rue de l’Immobilier, Paris</p>
        </div>
        <div className="info-card">
          <span>⏰</span>
          <h3>Horaires</h3>
          <p>Lun - Ven : 09h - 18h</p>
        </div>
      </section>

      {/* Formulaire + Image */}
      <section className="contact-form-section">
        <div className="form-container">
          <h2>Envoyez-nous un message</h2>
          <form>
            <div className="form-row">
              <input type="text" placeholder="Nom" required />
              <input type="email" placeholder="Email" required />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Téléphone" />
              <input type="text" placeholder="Sujet" />
            </div>
            <textarea placeholder="Votre message..." required></textarea>
            <button type="submit">Envoyer</button>
          </form>
        </div>
        <div className="contact-image">
          <img src="\src\assets\Images\contact.jpg" alt="Équipe ImmoPredict" />
        </div>
      </section>

      {/* Bloc promotionnel */}
      <section className="contact-cta">
        <h2>Estimez gratuitement votre bien avec ImmoPredict</h2>
        <p>Recevez une estimation rapide et fiable en quelques clics.</p>
        <a href="/estimer" className="cta-btn">Estimer mon bien</a>
      </section>

      <Footer />
    </div>
  );
}
