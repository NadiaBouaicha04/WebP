import "../assets/Styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">🏡 ImmoPredict</div>
      <ul className="navbar-links">
        <li><a href="/">Accueil</a></li>
        <li><a href="/acheter">Acheter</a></li>
        <li><a href="/vendre">Vendre</a></li>
        <li><a href="/louer">Louer</a></li>
        <li><a href="/apropos">À propos</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
      <div className="navbar-actions">
        <a href="/signin" className="btn-signin">Sign in</a>
        <a href="/signup" className="btn-signup">Sign up</a>
      </div>
    </nav>
  );
}
