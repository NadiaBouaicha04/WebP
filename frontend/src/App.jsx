import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./assets/Styles/Home.css";

// Pages existantes
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Estimate from "./pages/Estimate";
import Auth from "./pages/Auth";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Anciennes pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<Auth />} />

        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/estimate" element={<Estimate />} />
      </Routes>
    </Router>
  );
}

export default App;
