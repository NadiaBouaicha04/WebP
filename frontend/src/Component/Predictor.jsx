// src/components/Predictor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, MenuItem, Typography, 
  CircularProgress, Box, Grid, Paper, Chip, Alert, Card, CardContent,
  Slider
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
});

const Predictor = () => {
  const [formData, setFormData] = useState({
    Rooms: 2,
    Area: 50,
    Governorate: '',
    Category: ''
  });

  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [averagePrices, setAveragePrices] = useState([]);
  const [simulationData, setSimulationData] = useState({
    Rooms: 2,
    Area: 50
  });

  const categories = ['Appartement', 'Villa', 'Maison'];
  const currencies = ['EUR', 'USD', 'GBP', 'CAD', 'JPY'];

  // Gouvernorats pour la carte
  const governoratesCoords = {
    'Tunis': [36.8065, 10.1815],
    'Ariana': [36.8663, 10.1647],
    'Ben Arous': [36.7435, 10.2317],
    'Manouba': [36.808, 10.101],
    'Nabeul': [36.451, 10.735],
    'Zaghouan': [36.4029, 10.1429],
    'Bizerte': [37.2746, 9.8739],
    'Beja': [36.7333, 9.1833],
    'Jendouba': [36.5011, 8.7802],
    'Le Kef': [36.1826, 8.714],
    'Siliana': [36.0881, 9.3645],
    'Sousse': [35.8256, 10.6084],
    'Monastir': [35.777, 10.8262],
    'Mahdia': [35.5047, 11.0622],
    'Sfax': [34.7406, 10.7603],
    'Kairouan': [35.6781, 10.0963],
    'Kasserine': [35.1676, 8.8365],
    'Sidi Bouzid': [35.0382, 9.484],
    'Gabès': [33.8815, 10.0982],
    'Medenine': [33.3549, 10.5055],
    'Tataouine': [32.9297, 10.4518],
    'Tozeur': [33.9197, 8.1335],
    'Kebili': [33.7044, 8.969],
    'Gafsa': [34.425, 8.7842]
  };

  // Validation
  const validateField = (name, value) => {
    let error = '';
    if (name === 'Rooms') {
      if (!value) error = 'Ce champ est requis';
      else if (value < 1 || value > 7) error = 'Le nombre de pièces doit être entre 1 et 7';
    }
    if (name === 'Area') {
      if (!value) error = 'Ce champ est requis';
      else if (value < 10 || value > 1000) error = 'La surface doit être entre 10 et 1000 m²';
    }
    if (name === 'Governorate' && !value) error = 'Veuillez sélectionner un gouvernorat';
    if (name === 'Category' && !value) error = 'Veuillez sélectionner un type de propriété';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSimulationChange = (name, value) => {
    setSimulationData({ ...simulationData, [name]: value });
    
    // Mise à jour en temps réel des scénarios si une prédiction existe
    if (prediction) {
      updateScenarios(value, name);
    }
  };

  // Mise à jour des scénarios en fonction des changements de slider
  const updateScenarios = (value, field) => {
    if (!prediction) return;
    
    const ratio = field === 'Area' ? value / formData.Area : value / formData.Rooms;
    
    const updatedPrediction = {
      ...prediction,
      prediction: prediction.originalPrediction * ratio,
      min_price: prediction.originalMin * ratio,
      max_price: prediction.originalMax * ratio
    };
    
    setPrediction(updatedPrediction);
  };

  // Conversion devises
  const convertCurrency = async (amount, targetCurrency) => {
    try {
      const res = await axios.get('https://open.er-api.com/v6/latest/TND');
      const rate = res.data.rates[targetCurrency];
      if (rate) setConvertedPrice(amount * rate);
      else setConvertedPrice(null);
    } catch (err) {
      console.error("Erreur conversion devise:", err);
      setConvertedPrice(null);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prédiction
      const response = await axios.post('http://localhost:5000/predict', formData);
      // Stocker les valeurs originales pour les calculs de simulation
      const predictionWithOriginals = {
        ...response.data,
        originalPrediction: response.data.prediction,
        originalMin: response.data.min_price,
        originalMax: response.data.max_price
      };
      setPrediction(predictionWithOriginals);
      setConvertedPrice(null);

      // Récupérer tous les prix moyens
      const pricesRes = await axios.get('http://localhost:5000/average_prices');
      setAveragePrices(pricesRes.data);
    } catch (error) {
      console.error('Erreur de prédiction:', error);
      setErrors({...errors, submit: 'Erreur lors de la prédiction. Veuillez réessayer.'});
    }
    setLoading(false);
  };

  // Données pour le graphique bar
  const chartData = prediction && prediction.min_price && prediction.max_price ? [
    { name: "Prix Min", value: prediction.min_price },
    { name: "Estimation", value: prediction.prediction },
    { name: "Prix Max", value: prediction.max_price },
  ] : [];

  const COLORS = ['#8884d8', '#007bff', '#82ca9d'];

  // Données pour le graphique d'évolution des prix
  const getPriceEvolutionData = () => {
    if (!prediction) return [];
    
    return Array.from({length: 10}, (_, i) => {
      const surface = simulationData.Area + i * 20;
      const ratio = surface / formData.Area;
      
      return {
        surface,
        conservateur: prediction.originalMin * ratio,
        moyen: prediction.originalPrediction * ratio,
        optimiste: prediction.originalMax * ratio,
      };
    });
  };

  return (
    <Box sx={{ maxWidth: 1400, margin: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h3" gutterBottom align="center" color="#16a085" fontWeight="700" sx={{ mb: 4 }}>
        🏠 Estimateur de Prix Immobilier en Tunisie
      </Typography>

      <Grid container spacing={4}>
        {/* Colonne gauche: Formulaire + Card Simulation + Tableau */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(145deg, #f5f7fa, #e4e8f0)', height: 'fit-content' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#2c3e50', textAlign: 'center' }}>
              Détails du bien
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre de pièces"
                    type="number"
                    name="Rooms"
                    value={formData.Rooms}
                    onChange={handleChange}
                    error={!!errors.Rooms}
                    helperText={errors.Rooms}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Surface (m²)"
                    type="number"
                    name="Area"
                    value={formData.Area}
                    onChange={handleChange}
                    error={!!errors.Area}
                    helperText={errors.Area}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Gouvernorat"
                    name="Governorate"
                    value={formData.Governorate}
                    onChange={handleChange}
                    error={!!errors.Governorate}
                    helperText={errors.Governorate}
                  >
                    <MenuItem value="">Sélectionnez un gouvernorat</MenuItem>
                    {Object.keys(governoratesCoords).map(gov => (
                      <MenuItem key={gov} value={gov}>{gov}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Type de propriété"
                    name="Category"
                    value={formData.Category}
                    onChange={handleChange}
                    error={!!errors.Category}
                    helperText={errors.Category}
                  >
                    <MenuItem value="">Sélectionnez un type</MenuItem>
                    {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
              <Box textAlign="center" mt={2}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large" 
                  disabled={loading}
                  sx={{ px: 5, py: 1.8, borderRadius: 2, fontSize: '1.1rem', fontWeight: '600' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Estimer le prix'}
                </Button>
              </Box>
              {errors.submit && <Alert severity="error" sx={{ mt: 2 }}>{errors.submit}</Alert>}
            </form>
          </Paper>

          {/* Card Simulation */}
          {prediction && (
            <Card sx={{ mt: 3, p: 2, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>🔮 Mode Simulation</Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Surface: {simulationData.Area} m²
                  </Typography>
                  <Slider
                    value={simulationData.Area}
                    onChange={(e, newValue) => handleSimulationChange('Area', newValue)}
                    valueLabelDisplay="auto"
                    min={20}
                    max={500}
                    step={10}
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Pièces: {simulationData.Rooms}
                  </Typography>
                  <Slider
                    value={simulationData.Rooms}
                    onChange={(e, newValue) => handleSimulationChange('Rooms', newValue)}
                    valueLabelDisplay="auto"
                    min={1}
                    max={7}
                    step={1}
                  />
                </Box>

                <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: "#f5f5f5" }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Scénarios:</Typography>
                  <Typography variant="body2">
                    Conservateur: {prediction.min_price ? Math.round(prediction.min_price).toLocaleString() : 'N/A'} TND
                  </Typography>
                  <Typography variant="body2">
                    Moyen: {prediction.prediction ? Math.round(prediction.prediction).toLocaleString() : 'N/A'} TND
                  </Typography>
                  <Typography variant="body2">
                    Optimiste: {prediction.max_price ? Math.round(prediction.max_price).toLocaleString() : 'N/A'} TND
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Tableau comparatif */}
          {prediction && averagePrices.length > 0 && (
            <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                📋 Comparaison des prix par gouvernorat
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Gouvernorat</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Prix moyen (TND)</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Prix min (TND)</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Prix max (TND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {averagePrices.map((item, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #eee',
                        background: item.Governorate === formData.Governorate ? '#e3f2fd' : 'transparent'
                      }}>
                        <td style={{ padding: '12px', fontWeight: item.Governorate === formData.Governorate ? 'bold' : 'normal' }}>{item.Governorate}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: item.Governorate === formData.Governorate ? 'bold' : 'normal' }}>{Math.round(item.mean).toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{Math.round(item.min).toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{Math.round(item.max).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Colonne droite: Prédiction + Carte + Graphique */}
        <Grid item xs={12} lg={8}>
          {prediction ? (
            <>
              {/* Prédiction et Conversion */}
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>📊 Résultat de l'estimation</Typography>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center', p: 3, borderRadius: 3, boxShadow: 2, background: '#cdffd2ff' }}>
                      <Typography variant="h3" color="#547e55" fontWeight="700" sx={{ mb: 1 }}>
                        {Math.round(prediction.prediction).toLocaleString()} TND
                      </Typography>
                      <Chip label={`Confiance: ${prediction.confidence}%`} color={prediction.confidence > 80 ? "success" : prediction.confidence > 60 ? "warning" : "error"} sx={{ mt: 1, fontSize: '1rem', padding: '6px 12px' }} />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <TextField select fullWidth label="Convertir en devise" value={currency} onChange={(e) => {
                        setCurrency(e.target.value);
                        convertCurrency(prediction.prediction, e.target.value);
                      }}>
                        {currencies.map(cur => <MenuItem key={cur} value={cur}>{cur}</MenuItem>)}
                      </TextField>
                      {convertedPrice && (
                        <Box sx={{ p: 2, background: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h6">{convertedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {chartData.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom align="center">Comparaison des prix</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value.toLocaleString()} TND`, "Prix"]} />
                            <Bar dataKey="value">{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Carte */}
              {formData.Governorate && governoratesCoords[formData.Governorate] && (
                <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                  <Typography variant="h4" gutterBottom>📍 Localisation - {formData.Governorate}</Typography>
                  <Box sx={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                    <MapContainer center={governoratesCoords[formData.Governorate]} zoom={10} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                      <Marker position={governoratesCoords[formData.Governorate]}>
                        <Popup>
                          <Typography variant="h6">{formData.Governorate}</Typography>
                          <Typography>Prix estimé: {Math.round(prediction.prediction).toLocaleString()} TND</Typography>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </Box>
                </Paper>
              )}

              {/* Graphique d'évolution des prix */}
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom>📈 Évolution du prix selon la surface</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getPriceEvolutionData()}>
                    <XAxis dataKey="surface" label={{ value: "Surface (m²)", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Prix (TND)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${Math.round(value).toLocaleString()} TND`, "Prix"]} />
                    <Legend />
                    <Line type="monotone" dataKey="conservateur" stroke="#ff6f61" name="Conservateur" />
                    <Line type="monotone" dataKey="moyen" stroke="#007bff" name="Moyen" />
                    <Line type="monotone" dataKey="optimiste" stroke="#28a745" name="Optimiste" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </>
          ) : (
            <Paper elevation={4} sx={{ p: 8, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)' }}>
              <Typography variant="h2" sx={{ mb: 3, color: '#bdc3c7' }}>🏠</Typography>
              <Typography variant="h5" color="textSecondary">Renseignez les détails de votre bien immobilier pour obtenir une estimation de prix précise</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Predictor;