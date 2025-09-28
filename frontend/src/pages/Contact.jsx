import React, { useState } from "react";
import Navbar from "../Component/Navbar.jsx";
import Footer from "../Component/Footer.jsx";
import "./../assets/Styles/Contact.css";
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici vous ajouterez la logique pour traiter le formulaire
    alert("Merci pour votre message ! Nous vous répondrons rapidement.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <>
      <Navbar />
      <div className="contact-container">
        <div className="contact-hero">
          <h1>Contactez-nous</h1>
          <p>Nous sommes là pour répondre à toutes vos questions</p>
          <div className="animated-house">
            <div className="house"></div>
            <div className="roof"></div>
            <div className="window"></div>
            <div className="door"></div>
            <div className="chimney"></div>
          </div>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h2>Restons en contact</h2>
            <p>Notre équipe est à votre disposition pour vous accompagner dans tous vos projets immobiliers.</p>
            
            <div className="contact-item">
              <div className="icon-container">
                <div className="icon email"></div>
              </div>
              <div className="contact-details">
                <h3>Email</h3>
                <p>contact@reallypro.com</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon-container">
                <div className="icon phone"></div>
              </div>
              <div className="contact-details">
                <h3>Téléphone</h3>
                <p>+33 1 23 45 67 89</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon-container">
                <div className="icon location"></div>
              </div>
              <div className="contact-details">
                <h3>Adresse</h3>
                <p>123 Avenue de l'Immobilier, 75000 Paris</p>
              </div>
            </div>

            <div className="social-media">
              <h3>Suivez-nous</h3>
              <div className="social-icons">
                <a href="#" className="social-icon facebook"></a>
                <a href="#" className="social-icon twitter"></a>
                <a href="#" className="social-icon instagram"></a>
                <a href="#" className="social-icon linkedin"></a>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Envoyez-nous un message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <label className="form-label">Votre nom</label>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <label className="form-label">Votre email</label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <label className="form-label">Sujet</label>
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="form-input textarea"
                  rows="5"
                ></textarea>
                <label className="form-label">Votre message</label>
              </div>

              <button type="submit" className="submit-btn">
                Envoyer le message
                <span className="send-icon"></span>
              </button>
            </form>
          </div>
        </div>

        <div className="map-section">
  <h2>Nous trouver</h2>
  <div className="map-container">
    <iframe
      title="Google Maps"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.999237258977!2d2.294481315674929!3d48.85837007928795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fdeb7df1b3d%3A0x2a0f2d1f1e3f59d!2sTour%20Eiffel%2C%20Paris%2C%20France!5e0!3m2!1sfr!2sfr!4v1693938412345!5m2!1sfr!2sfr"
      width="100%"
      height="400"
      style={{ border: 0, borderRadius: "15px" }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</div>

      </div>
      <Footer />
    </>
  );
};

export default Contact;