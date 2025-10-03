// Vérifiez que votre configuration API est correcte
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ou votre URL Flask
  timeout: 10000,
});

// Intercepteur pour debug
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Requête ${config.method?.toUpperCase()} vers: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

export default api;