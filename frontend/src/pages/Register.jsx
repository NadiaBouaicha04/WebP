import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("Homme");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !dob || !phone || !city || !gender || !password || !confirmPassword) {
      setMessage("❌ Tous les champs sont obligatoires !");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("❌ Adresse email invalide !");
      return;
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setMessage("❌ Le numéro de téléphone doit contenir exactement 8 chiffres !");
      return;
    }

    const today = new Date();
    const birthDate = new Date(dob);
    if (birthDate > today) {
      setMessage("❌ La date de naissance ne peut pas dépasser aujourd'hui !");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        dob,
        phone,
        city,
        gender,
        password,
        confirm_password: confirmPassword,
      });
      setMessage("✅ Inscription réussie !");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Erreur, réessayez !");
    }
  };

  // Styles inline
  const styles = {
    body: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)",
      padding: "2rem 1rem",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    container: {
      width: "100%",
      maxWidth: "500px",
      margin: "0 auto"
    },
    form: {
      background: "white",
      padding: "2.5rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)"
    },
    title: {
      textAlign: "center",
      color: "#333",
      marginBottom: "2rem",
      fontSize: "2rem",
      fontWeight: "700",
      background: "linear-gradient(135deg, #66eae3ff, #4ba285ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text"
    },
    formGroup: {
      marginBottom: "1.5rem",
      position: "relative"
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      color: "#555",
      fontWeight: "600",
      fontSize: "0.9rem",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e1e5e9",
      borderRadius: "12px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      backgroundColor: "#f8f9fa",
      boxSizing: "border-box"
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e1e5e9",
      borderRadius: "12px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      backgroundColor: "#f8f9fa",
      boxSizing: "border-box",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 16px center",
      backgroundSize: "12px",
      cursor: "pointer"
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #489780ff 0%, #258a74ff 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginTop: "1rem"
    },
    successMessage: {
      background: "#d4edda",
      color: "#155724",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #c3e6cb",
      marginTop: "1rem",
      textAlign: "center",
      fontWeight: "500",
      animation: "slideIn 0.3s ease-out"
    },
    errorMessage: {
      background: "#f8d7da",
      color: "#721c24",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #f5c6cb",
      marginTop: "1rem",
      textAlign: "center",
      fontWeight: "500",
      animation: "slideIn 0.3s ease-out"
    }
  };

  // Styles pour les états hover/focus
  const inputFocusStyle = {
    outline: "none",
    borderColor: "#667eea",
    backgroundColor: "white",
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    transform: "translateY(-2px)"
  };

  const buttonHoverStyle = {
    transform: "translateY(-3px)",
    boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)"
  };

  return (
    <>
      <Navbar />
      <div style={styles.body}>
        <div style={styles.container}>
          <form 
            style={styles.form} 
            onSubmit={handleSubmit}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 25px 50px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.1)";
            }}
          >
            <h1 style={styles.title}>Créer un compte</h1>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nom complet</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date de naissance</label>
              <input 
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Numéro de téléphone</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ville</label>
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Genre</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                style={styles.select}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              >
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mot de passe</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmer le mot de passe</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#c8d0e7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#e1e5e9";
                  }
                }}
              />
            </div>

            <button 
              type="submit" 
              style={styles.button}
              onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
              onMouseDown={(e) => {
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseUp={(e) => {
                e.target.style.transform = "translateY(-3px)";
              }}
            >
              S'inscrire
            </button>

            {message && (
              <p style={message.startsWith("✅") ? styles.successMessage : styles.errorMessage}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}