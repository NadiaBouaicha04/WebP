import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography, Avatar,
  List, ListItem, ListItemText, ListItemAvatar,
  CircularProgress, Container, Chip, IconButton,
  Card, CardContent, Fade, Zoom, Grid
} from '@mui/material';
import { Send, SmartToy, Person, AutoAwesome } from '@mui/icons-material';
import axios from 'axios';
import { styled, keyframes } from '@mui/material/styles';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 20px rgba(46, 204, 113, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(46, 204, 113, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(46, 204, 113, 0.3);
  }
`;

const typingAnimation = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

// Composants stylisés
const GlassChatContainer = styled(Paper)(({ theme }) => ({
  height: '700px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '24px',
  background: 'linear-gradient(135deg, rgba(248, 255, 249, 0.9), rgba(232, 245, 233, 0.8))',
  backdropFilter: 'blur(10px)',
  boxShadow: `
    0 8px 32px rgba(46, 204, 113, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
  `,
  border: '1px solid rgba(46, 204, 113, 0.2)',
  animation: `${fadeInUp} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #27ae60, #2ecc71, #27ae60)',
    animation: `${pulseGlow} 3s ease-in-out infinite`,
  }
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  background: `
    radial-gradient(circle at 20% 80%, rgba(46, 204, 113, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(39, 174, 96, 0.05) 0%, transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 255, 249, 0.6) 100%)
  `,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(46, 204, 113, 0.1)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(45deg, #27ae60, #2ecc71)',
    borderRadius: '10px',
  },
  '& > *': {
    marginBottom: '16px',
    animation: `${fadeInUp} 0.4s ease-out`,
  },
}));

const UserMessage = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-start',
  gap: '12px',
});

const BotMessage = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '12px',
});

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: '16px 20px',
  maxWidth: '75%',
  background: isUser 
    ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 248, 246, 0.9))',
  color: isUser ? 'white' : '#2c3e50',
  borderRadius: isUser ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
  boxShadow: isUser 
    ? '0 4px 20px rgba(39, 174, 96, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
    : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05)',
  border: isUser 
    ? '1px solid rgba(255, 255, 255, 0.2)'
    : '1px solid rgba(46, 204, 113, 0.15)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isUser 
      ? '0 6px 25px rgba(39, 174, 96, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)'
      : '0 6px 25px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  '&::before': isUser ? {
    content: '""',
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '50%',
  } : {},
}));

const StyledAvatar = styled(Avatar)(({ theme, isUser }) => ({
  width: 40,
  height: 40,
  background: isUser 
    ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
    : 'linear-gradient(135deg, #3498db, #2980b9)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
  border: '2px solid rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
  color: 'white',
  width: '54px',
  height: '54px',
  borderRadius: '50%',
  boxShadow: '0 4px 20px rgba(39, 174, 96, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #219653, #27ae60)',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 25px rgba(39, 174, 96, 0.6)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #bdc3c7, #95a5a6)',
    transform: 'scale(1)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(46, 204, 113, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(46, 204, 113, 0.4)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.98)',
      border: '2px solid #27ae60',
      boxShadow: '0 0 0 3px rgba(39, 174, 96, 0.1)',
    },
    '& input': {
      padding: '16px 20px',
      fontSize: '0.95rem',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const QuestionChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.05))',
  color: '#27ae60',
  border: '1px solid rgba(39, 174, 96, 0.3)',
  borderRadius: '20px',
  padding: '8px 16px',
  fontWeight: '500',
  fontSize: '0.85rem',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.2), rgba(46, 204, 113, 0.1))',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(39, 174, 96, 0.2)',
    border: '1px solid rgba(39, 174, 96, 0.5)',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: '24px',
  borderBottom: '1px solid rgba(46, 204, 113, 0.2)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 255, 249, 0.9))',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(46, 204, 113, 0.3), transparent)',
  },
}));

const LoadingDots = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  '& > div': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    animation: `${typingAnimation} 1.4s ease-in-out infinite`,
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
}));

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Message de bienvenue
  useEffect(() => {
    setMessages([{
      id: 1,
      text: "👋 Bonjour ! Je suis votre assistant immobilier intelligent. Je peux vous aider avec :\n\n• Les prix du marché en Tunisie\n• Les tendances par région\n• Les conseils d'investissement\n• L'analyse de propriétés\n\nPosez-moi vos questions sur l'immobilier !",
      isUser: false,
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/chat', {
        question: input
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ Désolé, je rencontre un problème technique. Veuillez réessayer.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Quels sont les prix moyens à Tunis ?",
    "Quelle est la tendance du marché ?",
    "Quels sont les meilleurs investissements ?",
    "Comment estimer ma propriété ?"
  ];

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4, 
      mb: 4,
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Zoom in={true} timeout={800}>
        <Typography 
          variant="h2" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 6,
            background: 'linear-gradient(135deg, #27ae60, #2ecc71, #219653)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            fontWeight: '800',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            textShadow: '0 4px 15px rgba(39, 174, 96, 0.2)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '25%',
              right: '25%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #27ae60, transparent)',
              borderRadius: '2px',
            }
          }}
        >
          <AutoAwesome sx={{ 
            fontSize: '2.5rem', 
            mr: 2,
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }} />
          Assistant Immobilier Intelligent
        </Typography>
      </Zoom>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <GlassChatContainer>
            <HeaderBox>
              <Typography variant="h5" sx={{ 
                color: '#27ae60', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SmartToy sx={{ fontSize: '1.8rem' }} />
                Conversation avec l'Expert
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#7f8c8d',
                mt: 1,
                fontSize: '0.9rem'
              }}>
                Discutez avec notre IA spécialisée pour des conseils immobiliers personnalisés
              </Typography>
            </HeaderBox>

            <MessageList>
              {messages.map((message) => (
                <Fade in={true} key={message.id} timeout={500}>
                  {message.isUser ? (
                    <UserMessage>
                      <MessageBubble isUser={true}>
                        <Typography variant="body1" sx={{ 
                          lineHeight: '1.5',
                          fontSize: '0.95rem'
                        }}>
                          {message.text}
                        </Typography>
                      </MessageBubble>
                      <StyledAvatar isUser={true}>
                        <Person />
                      </StyledAvatar>
                    </UserMessage>
                  ) : (
                    <BotMessage>
                      <StyledAvatar isUser={false}>
                        <SmartToy />
                      </StyledAvatar>
                      <MessageBubble isUser={false}>
                        <Typography variant="body1" sx={{ 
                          whiteSpace: 'pre-line',
                          lineHeight: '1.6',
                          fontSize: '0.95rem'
                        }}>
                          {message.text}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#95a5a6', 
                          mt: 1.5, 
                          display: 'block',
                          fontSize: '0.75rem'
                        }}>
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </MessageBubble>
                    </BotMessage>
                  )}
                </Fade>
              ))}
              {loading && (
                <BotMessage>
                  <StyledAvatar isUser={false}>
                    <SmartToy />
                  </StyledAvatar>
                  <MessageBubble isUser={false}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LoadingDots>
                        <div></div>
                        <div></div>
                        <div></div>
                      </LoadingDots>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Analyse en cours...
                      </Typography>
                    </Box>
                  </MessageBubble>
                </BotMessage>
              )}
              <div ref={messagesEndRef} />
            </MessageList>

            <Box sx={{ 
              p: 3, 
              borderTop: '1px solid rgba(46, 204, 113, 0.15)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 255, 249, 0.9))',
              backdropFilter: 'blur(10px)',
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                mb: 3, 
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {suggestedQuestions.map((question, index) => (
                  <QuestionChip
                    key={index}
                    label={question}
                    onClick={() => setInput(question)}
                    clickable
                  />
                ))}
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center'
              }}>
                <StyledTextField
                  fullWidth
                  variant="outlined"
                  placeholder="Posez votre question sur l'immobilier tunisien..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <AnimatedIconButton 
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                >
                  <Send />
                </AnimatedIconButton>
              </Box>
            </Box>
          </GlassChatContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chatbot;