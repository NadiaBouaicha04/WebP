// src/components/Predictor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, MenuItem, Typography, 
  CircularProgress, Box, Grid, Paper, Chip, Alert, Card, CardContent,
  Slider, Fade, Zoom, Grow, Container
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import L from 'leaflet';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom'; // Import pour la navigation
import { Chat, SmartToy } from '@mui/icons-material'; // Icône pour le bouton

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png',
});

// Composants stylisés avec thème vert
const GreenButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #16a085, #16a085)',
  borderRadius: '25px',
  padding: '12px 30px',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  boxShadow: '0 4px 15px 0 rgba(39, 174, 96, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #16a085, #16a085)',
    boxShadow: '0 6px 20px 0 rgba(39, 174, 96, 0.4)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'linear-gradient(145deg, #f8fff9, #e8f5e9)',
  boxShadow: '0 8px 32px rgba(46, 204, 113, 0.1)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const ChatbotButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #3498db, #16a085)',
  borderRadius: '25px',
  padding: '12px 30px',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  boxShadow: '0 4px 15px 0 rgba(52, 152, 219, 0.3)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #16a085, #16a085)',
    boxShadow: '0 6px 20px 0 rgba(52, 152, 219, 0.4)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const PredictionCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #16a085, #16a085)',
  color: 'white',
  borderRadius: '20px',
  padding: theme.spacing(3),
  textAlign: 'center',
  boxShadow: '0 10px 30px rgba(39, 174, 96, 0.3)',
}));

const Predictor = () => {
  const navigate = useNavigate(); // Hook pour la navigation
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
  const [showAnimation, setShowAnimation] = useState(false);

  const categories = ['Appartement', 'Villa', 'Maison'];
  const currencies = ['EUR', 'USD', 'GBP', 'CAD', 'JPY'];

  const handleGoToChatbot = () => {
    navigate('/chatbot'); // Assurez-vous que cette route est définie dans votre App.js
  };

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
    
    if (prediction) {
      updateScenarios(value, name);
    }
  };

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
      const response = await axios.post('http://localhost:5005/predict', formData);
      const predictionWithOriginals = {
        ...response.data,
        originalPrediction: response.data.prediction,
        originalMin: response.data.min_price,
        originalMax: response.data.max_price
      };
      setPrediction(predictionWithOriginals);
      setConvertedPrice(null);
      setShowAnimation(true);

      const pricesRes = await axios.get('http://localhost:5005/average_prices');
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

  const GREEN_COLORS = ['#16a085', '#16a085', '#16a085'];

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

  // Nouvelles fonctionnalités - Données pour graphique de tendances
  const getMarketTrendsData = () => {
    return averagePrices.slice(0, 8).map(item => ({
      name: item.Governorate,
      prix: Math.round(item.mean),
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, p: 3 }}>
      <Zoom in={true} timeout={800}>
        <Typography variant="h2" gutterBottom align="center" sx={{ 
          mb: 6, 
          background: 'linear-gradient(45deg, #16a085, #16a085)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          fontWeight: '800',
          fontSize: { xs: '2rem', md: '3rem' }
        }}>
          🌿 Estimateur Intelligent de Prix Immobilier
        </Typography>
      </Zoom>

      <Grid container spacing={4}>
        {/* Colonne gauche: Formulaire + Simulation + Tableau */}
        <Grid item xs={12} lg={4}>
          <Grow in={true} timeout={600}>
            <StyledPaper elevation={0}>
              <Typography variant="h4" gutterBottom sx={{ 
                mb: 4, 
                color: '#2c3e50', 
                textAlign: 'center',
                fontWeight: '600'
              }}>
                🏡 Détails du bien
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
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
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
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
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
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
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
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    >
                      <MenuItem value="">Sélectionnez un type</MenuItem>
                      {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>

                {/* MODIFICATION ICI : Les deux boutons côte à côte */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'center', 
                  mt: 4,
                  flexWrap: 'wrap'
                }}>
                  <GreenButton 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Estimation...' : '🌱 Estimer le prix'}
                  </GreenButton>
                  
                  <ChatbotButton 
                    variant="contained" 
                    size="large"
                    startIcon={<SmartToy />}
                    onClick={handleGoToChatbot}
                  >
                    🤖 Assistant IA
                  </ChatbotButton>
                </Box>

                {errors.submit && <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>{errors.submit}</Alert>}
              </form>
            </StyledPaper>
          </Grow>

          {/* Le reste du code reste inchangé */}
          {/* Card Simulation améliorée */}
          {prediction && (
            <Fade in={showAnimation} timeout={1000}>
              <Card sx={{ 
                mt: 3, 
                p: 3, 
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #f0fff4, #e0f7ea)',
                border: '1px solid rgba(46, 204, 113, 0.2)'
              }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ color: '#16a085', fontWeight: '600' }}>
                    🔮 Mode Simulation Interactive
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: '500', color: '#2c3e50' }}>
                      Surface: {simulationData.Area} m²
                    </Typography>
                    <Slider
                      value={simulationData.Area}
                      onChange={(e, newValue) => handleSimulationChange('Area', newValue)}
                      valueLabelDisplay="auto"
                      min={20}
                      max={500}
                      step={10}
                      sx={{
                        color: '#16a085',
                        '& .MuiSlider-thumb': {
                          backgroundColor: '#16a085',
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: '500', color: '#2c3e50' }}>
                      Pièces: {simulationData.Rooms}
                    </Typography>
                    <Slider
                      value={simulationData.Rooms}
                      onChange={(e, newValue) => handleSimulationChange('Rooms', newValue)}
                      valueLabelDisplay="auto"
                      min={1}
                      max={7}
                      step={1}
                      sx={{
                        color: '#16a085',
                        '& .MuiSlider-thumb': {
                          backgroundColor: '#16a085',
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ 
                    mt: 4, 
                    p: 3, 
                    borderRadius: '16px', 
                    background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
                    border: '1px solid #a5d6a7'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16a085', mb: 2 }}>
                      📊 Scénarios de Prix:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ textAlign: 'center', flex: 1, minWidth: '100px' }}>
                        <Typography variant="body2" sx={{ color: '#e74c3c', fontWeight: '600' }}>Conservateur</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {prediction.min_price ? Math.round(prediction.min_price).toLocaleString() : 'N/A'} TND
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1, minWidth: '100px' }}>
                        <Typography variant="body2" sx={{ color: '#f39c12', fontWeight: '600' }}>Moyen</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {prediction.prediction ? Math.round(prediction.prediction).toLocaleString() : 'N/A'} TND
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1, minWidth: '100px' }}>
                        <Typography variant="body2" sx={{ color: '#16a085', fontWeight: '600' }}>Optimiste</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {prediction.max_price ? Math.round(prediction.max_price).toLocaleString() : 'N/A'} TND
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Tableau comparatif amélioré */}
          {prediction && averagePrices.length > 0 && (
            <Grow in={showAnimation} timeout={1500}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mt: 3, 
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #f8fff9, #e8f5e9)',
                border: '1px solid rgba(46, 204, 113, 0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  textAlign: 'center', 
                  color: '#16a085',
                  fontWeight: '600',
                  mb: 3
                }}>
                  📋 Comparaison des Marchés
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto', borderRadius: '12px' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <thead>
                      <tr style={{ 
                        background: 'linear-gradient(45deg, #16a085, #16a085)',
                        color: 'white'
                      }}>
                        <th style={{ 
                          padding: '16px', 
                          textAlign: 'left', 
                          borderBottom: '2px solid #16a085',
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}>Gouvernorat</th>
                        <th style={{ 
                          padding: '16px', 
                          textAlign: 'right', 
                          borderBottom: '2px solid #16a085',
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}>Prix moyen (TND)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {averagePrices.map((item, index) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #e0f2e1',
                          background: item.Governorate === formData.Governorate ? 
                            'linear-gradient(45deg, #e8f5e9, #c8e6c9)' : 
                            index % 2 === 0 ? '#f8fff9' : 'transparent',
                          transition: 'all 0.3s ease'
                        }}>
                          <td style={{ 
                            padding: '14px', 
                            fontWeight: item.Governorate === formData.Governorate ? 'bold' : 'normal',
                            color: item.Governorate === formData.Governorate ? '#16a085' : '#2c3e50'
                          }}>
                            {item.Governorate}
                            {item.Governorate === formData.Governorate && ' 🎯'}
                          </td>
                          <td style={{ 
                            padding: '14px', 
                            textAlign: 'right', 
                            fontWeight: item.Governorate === formData.Governorate ? 'bold' : 'normal',
                            color: item.Governorate === formData.Governorate ? '#16a085' : '#2c3e50'
                          }}>
                            {Math.round(item.mean).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </Grow>
          )}
        </Grid>

        {/* Colonne droite: Prédiction + Carte + Graphiques */}
        <Grid item xs={12} lg={8}>
          {prediction ? (
            <>
              {/* Prédiction et Conversion */}
              <Fade in={showAnimation} timeout={800}>
                <StyledPaper elevation={0} sx={{ mb: 4 }}>
                  <Typography variant="h4" gutterBottom sx={{ 
                    mb: 4, 
                    color: '#2c3e50',
                    fontWeight: '600'
                  }}>
                    📊 Résultat de l'estimation
                  </Typography>
                  <Grid container spacing={4} alignItems="stretch">
                    <Grid item xs={12} md={6}>
                      <PredictionCard>
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {Math.round(prediction.prediction).toLocaleString()} TND
                        </Typography>
                        <Chip 
                          label={`Confiance: ${prediction.confidence}%`} 
                          sx={{ 
                            mt: 1, 
                            fontSize: '1rem', 
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: '600',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                      </PredictionCard>

                      <Box sx={{ mt: 3 }}>
                        <TextField 
                          select 
                          fullWidth 
                          label="Convertir en devise" 
                          value={currency} 
                          onChange={(e) => {
                            setCurrency(e.target.value);
                            convertCurrency(prediction.prediction, e.target.value);
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            }
                          }}
                        >
                          {currencies.map(cur => <MenuItem key={cur} value={cur}>{cur}</MenuItem>)}
                        </TextField>
                        {convertedPrice && (
                          <Box sx={{ 
                            p: 3, 
                            background: 'linear-gradient(45deg, #e8f5e9, #c8e6c9)', 
                            borderRadius: '16px', 
                            textAlign: 'center',
                            mt: 2,
                            border: '1px solid #a5d6a7'
                          }}>
                            <Typography variant="h5" sx={{ color: '#16a085', fontWeight: 'bold' }}>
                              {convertedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    {chartData.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          p: 3, 
                          background: 'linear-gradient(145deg, #f8fff9, #e8f5e9)',
                          borderRadius: '20px',
                          height: '100%'
                        }}>
                          <Typography variant="h6" gutterBottom align="center" sx={{ color: '#2c3e50', fontWeight: '600' }}>
                            📈 Analyse des Prix
                          </Typography>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value) => [`${value.toLocaleString()} TND`, "Prix"]}
                                contentStyle={{ borderRadius: '12px' }}
                              />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={GREEN_COLORS[index % GREEN_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </StyledPaper>
              </Fade>

              {/* Nouveau graphique de tendances du marché */}
              {averagePrices.length > 0 && (
                <Grow in={showAnimation} timeout={1200}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: '20px',
                    background: 'linear-gradient(145deg, #f8fff9, #e8f5e9)',
                    border: '1px solid rgba(46, 204, 113, 0.1)'
                  }}>
                    <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: '600' }}>
                      📊 Tendances du Marché par Gouvernorat
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={getMarketTrendsData()}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`${value.toLocaleString()} TND`, "Prix moyen"]}
                          contentStyle={{ borderRadius: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="prix" 
                          stroke="#16a085" 
                          fill="url(#colorGreen)" 
                          fillOpacity={0.6}
                        />
                        <defs>
                          <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a085" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#16a085" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grow>
              )}

              {/* Carte améliorée */}
              {formData.Governorate && governoratesCoords[formData.Governorate] && (
                <Fade in={showAnimation} timeout={1000}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: '20px',
                    background: 'linear-gradient(145deg, #f8fff9, #e8f5e9)',
                    border: '1px solid rgba(46, 204, 113, 0.1)'
                  }}>
                    <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: '600' }}>
                      📍 Localisation - {formData.Governorate}
                    </Typography>
                    <Box sx={{ 
                      height: '400px', 
                      width: '100%', 
                      borderRadius: '16px', 
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(46, 204, 113, 0.1)'
                    }}>
                      <MapContainer 
                        center={governoratesCoords[formData.Governorate]} 
                        zoom={10} 
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer 
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                          attribution="© OpenStreetMap" 
                        />
                        <Marker position={governoratesCoords[formData.Governorate]}>
                          <Popup>
                            <Typography variant="h6" sx={{ color: '#16a085', fontWeight: 'bold' }}>
                              {formData.Governorate}
                            </Typography>
                            <Typography>
                              Prix estimé: {Math.round(prediction.prediction).toLocaleString()} TND
                            </Typography>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </Box>
                  </Paper>
                </Fade>
              )}

              {/* Graphique d'évolution des prix amélioré */}
              <Grow in={showAnimation} timeout={1400}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  borderRadius: '20px',
                  background: 'linear-gradient(145deg, #f8fff9, #e8f5e9)',
                  border: '1px solid rgba(46, 204, 113, 0.1)'
                }}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: '600' }}>
                    📈 Projection selon la Surface
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getPriceEvolutionData()}>
                      <XAxis 
                        dataKey="surface" 
                        label={{ 
                          value: "Surface (m²)", 
                          position: "insideBottom", 
                          offset: -5,
                          style: { fill: '#2c3e50' }
                        }} 
                      />
                      <YAxis 
                        label={{ 
                          value: "Prix (TND)", 
                          angle: -90, 
                          position: "insideLeft",
                          style: { fill: '#2c3e50' }
                        }} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${Math.round(value).toLocaleString()} TND`, "Prix"]}
                        contentStyle={{ borderRadius: '12px' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="conservateur" 
                        stroke="#e74c3c" 
                        name="Conservateur" 
                        strokeWidth={2}
                        dot={{ fill: '#e74c3c' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moyen" 
                        stroke="#f39c12" 
                        name="Moyen" 
                        strokeWidth={3}
                        dot={{ fill: '#f39c12' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="optimiste" 
                        stroke="#16a085" 
                        name="Optimiste" 
                        strokeWidth={2}
                        dot={{ fill: '#16a085' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grow>
            </>
          ) : (
            <Fade in={true} timeout={800}>
              <Paper elevation={0} sx={{ 
                p: 8, 
                borderRadius: '20px', 
                textAlign: 'center', 
                background: 'linear-gradient(145deg, #f8fff9, #e8f5e9)',
                border: '2px dashed #bdc3c7'
              }}>
                <Typography variant="h1" sx={{ mb: 3, color: '#bdc3c7', fontSize: '4rem' }}>🌿</Typography>
                <Typography variant="h4" color="textSecondary" sx={{ fontWeight: '300' }}>
                  Renseignez les détails de votre bien pour découvrir son estimation précise
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                  Notre intelligence artificielle analyse le marché tunisien en temps réel
                </Typography>
              </Paper>
            </Fade>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Predictor;