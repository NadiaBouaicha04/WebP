import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import styled, { keyframes } from "styled-components";

// Animation fadeIn
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Footer container
const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #16a085, #16a085);
  color: white;
  padding: 30px 50px 40px;
  width: 100%;
  box-sizing: border-box;
  animation: ${fadeIn} 0.8s ease-in-out;
`;

// Footer content
const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 50px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Column
const Column = styled.div``;

// Column title
const ColumnTitle = styled.h3`
  font-size: 22px;
  margin-bottom: 20px;
  color: #dbe9ff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// Text
const AboutText = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: #dbe9ff;
  opacity: 0.9;
`;

// Links
const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  li {
    margin-bottom: 12px;
  }
  a {
    color: #dbe9ff;
    text-decoration: none;
    font-size: 15px;
    transition: color 0.3s ease, text-decoration 0.3s ease;
    &:hover {
      color: #ffffff;
      text-decoration: underline;
    }
  }
`;

// Contact info
const ContactInfo = styled.div`
  font-size: 15px;
  line-height: 1.7;
  color: #dbe9ff;
  opacity: 0.9;
  a {
    color: #dbe9ff;
    text-decoration: none;
    &:hover {
      color: #ffffff;
    }
  }
`;

// Social icons
const SocialIcons = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
  svg {
    color: #dbe9ff;
    font-size: 22px;
    cursor: pointer;
    transition: transform 0.3s ease, color 0.3s ease;
    &:hover {
      transform: scale(1.3);
      color: #ffffff;
    }
  }
`;

// Newsletter form
const NewsletterForm = styled.form`
  margin-top: 20px;
  display: flex;
  gap: 12px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  padding: 5px;

  input {
    padding: 10px 15px;
    border: none;
    border-radius: 15px;
    flex: 1;
    background: rgba(255,255,255,0.2);
    color: #ffffff;
    font-size: 14px;
    outline: none;
    &::placeholder {
      color: #d4e0ff;
      opacity: 0.8;
    }
    &:focus {
      background: rgba(255,255,255,0.3);
    }
  }

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 15px;
    background: #d4e0ff;
    color: #1e3c72;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease;
    &:hover {
      background: #b8d1ff;
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
    }
  }
`;

// Footer bottom
const FooterBottom = styled.div`
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
  color: #dbe9ff;
  opacity: 0.7;
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 20px;
  a {
    color: #dbe9ff;
    text-decoration: none;
    &:hover {
      color: #ffffff;
      text-decoration: underline;
    }
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        {/* About */}
        <Column>
          <ColumnTitle>À propos de RealtyPro</ColumnTitle>
          <AboutText>
            RealtyPro vous aide à trouver la maison de vos rêves. Découvrez nos biens immobiliers à vendre ou à louer, et bénéficiez de conseils personnalisés.
          </AboutText>
        </Column>

        {/* Quick Links */}
        <Column>
          <ColumnTitle>Liens rapides</ColumnTitle>
          <FooterLinks>
            <li><a href="#">Accueil</a></li>
            <li><a href="#">Biens à vendre</a></li>
            <li><a href="#">Biens à louer</a></li>
            <li><a href="#">Contact</a></li>
          </FooterLinks>
        </Column>

        {/* Contact & Social */}
        <Column>
          <ColumnTitle>Contact & Réseaux</ColumnTitle>
          <ContactInfo>
            <p>Email: <a href="mailto:contact@realtypro.com">contact@realtypro.com</a></p>
            <p>Téléphone: +33 1 23 45 67 89</p>
            <p>Adresse: 123 Rue de l’Immobilier, Paris</p>
          </ContactInfo>
          <SocialIcons>
            <FaFacebookF aria-label="Facebook" />
            <FaTwitter aria-label="Twitter" />
            <FaInstagram aria-label="Instagram" />
            <FaLinkedinIn aria-label="LinkedIn" />
          </SocialIcons>
          <NewsletterForm>
            <input type="email" placeholder="Recevez nos nouvelles annonces" required />
            <button type="submit">S’abonner</button>
          </NewsletterForm>
        </Column>
      </FooterContent>

      <FooterBottom>
        © 2025 RealtyPro. Tous droits réservés.
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
