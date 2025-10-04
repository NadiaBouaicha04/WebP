// src/services/auth.js
import api from '../api';

class AuthService {
  // Stocker le token et les infos utilisateur
  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Récupérer le token
  getToken() {
    return localStorage.getItem('token');
  }

  // Récupérer l'utilisateur
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.getToken();
  }

  // Vérifier si l'utilisateur est admin
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  // Déconnexion
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        // Appeler la route de déconnexion du backend
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage
      this.clearAuth();
    }
  }

  // Nettoyer toutes les données d'authentification
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export default new AuthService();