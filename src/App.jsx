import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "./assets/Styles/Home.css";
import Auth from "./pages/Auth";

// ✅ Import des pages
import Home from "./pages/Home";


// ✅ Pages simples
function About() {
  return (
    <div className="page">
      <h2>À propos</h2>
      <p>Bienvenue sur ImmoPredict, votre site de prédiction immobilière 🚀.</p>
    </div>
  );
}

function Contact() {
  return (
    <div className="page">
      <h2>Contact</h2>
      <p>Email : contact@immopredict.com</p>
      <p>Téléphone : +33 6 12 34 56 78</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        {/* ✅ Navbar */}
        
        {/* ✅ Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
           <Route path="/signin" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
