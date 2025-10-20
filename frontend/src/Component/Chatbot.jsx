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
    box-shadow: 0 0 25px rgba(46, 204, 113, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(46, 204, 113, 0.8);
  }
  100% {
    box-shadow: 0 0 25px rgba(46, 204, 113, 0.4);
  }
`;

const typingAnimation = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3;
`;

// Composants stylisés
const GlassChatContainer = styled(Paper)(({ theme }) => ({
  height: '85vh',
  minHeight: '800px',
  maxHeight: '900px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '28px',
  background: 'linear-gradient(135deg, rgba(248, 255, 249, 0.95), rgba(232, 245, 233, 0.9))',
  backdropFilter: 'blur(15px)',
  boxShadow: `
    0 12px 40px rgba(46, 204, 113, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.7),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1)
  `,
  border: '2px solid rgba(46, 204, 113, 0.25)',
  animation: `${fadeInUp} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #16a085, #16a085, #16a085)',
    animation: `${pulseGlow} 3s ease-in-out infinite`,
  }
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '25px',
  background: `
    radial-gradient(circle at 20% 80%, rgba(46, 204, 113, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(39, 174, 96, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 255, 249, 0.7) 100%)
  `,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(46, 204, 113, 0.15)',
    borderRadius: '12px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(45deg, #16a085, #16a085)',
    borderRadius: '12px',
  },
  '& > *': {
    marginBottom: '20px',
    animation: `${fadeInUp} 0.4s ease-out`,
  },
}));

const UserMessage = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-start',
  gap: '15px',
});

const BotMessage = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '15px',
});

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: '18px 24px',
  maxWidth: '70%',
  background: isUser 
    ? 'linear-gradient(135deg, #16a085, #16a085)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 246, 0.95))',
  color: isUser ? 'white' : '#2c3e50',
  borderRadius: isUser ? '28px 28px 10px 28px' : '28px 28px 28px 10px',
  boxShadow: isUser 
    ? '0 6px 25px rgba(39, 174, 96, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)'
    : '0 6px 25px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
  border: isUser 
    ? '1px solid rgba(255, 255, 255, 0.25)'
    : '1px solid rgba(46, 204, 113, 0.2)',
  backdropFilter: 'blur(15px)',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: isUser 
      ? '0 8px 30px rgba(39, 174, 96, 0.5), 0 6px 15px rgba(0, 0, 0, 0.2)'
      : '0 8px 30px rgba(0, 0, 0, 0.15), 0 6px 15px rgba(0, 0, 0, 0.1)',
  },
  '&::before': isUser ? {
    content: '""',
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '10px',
    height: '10px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '50%',
  } : {},
}));

const StyledAvatar = styled(Avatar)(({ theme, isUser }) => ({
  width: 48,
  height: 48,
  background: isUser 
    ? 'linear-gradient(135deg, #16a085, #16a085)'
    : 'linear-gradient(135deg, #3498db, #2980b9)',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
  border: '3px solid rgba(255, 255, 255, 0.9)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.15)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #16a085, #16a085)',
  color: 'white',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  boxShadow: '0 6px 25px rgba(39, 174, 96, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #16a085, #16a085)',
    transform: 'scale(1.15)',
    boxShadow: '0 8px 30px rgba(39, 174, 96, 0.7)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #bdc3c7, #95a5a6)',
    transform: 'scale(1)',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.15)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.8rem',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(46, 204, 113, 0.25)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.98)',
      border: '2px solid rgba(46, 204, 113, 0.5)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      border: '3px solid #16a085',
      boxShadow: '0 0 0 4px rgba(39, 174, 96, 0.15)',
    },
    '& input': {
      padding: '18px 24px',
      fontSize: '1.1rem',
      fontWeight: '500',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.1rem',
  },
}));

const QuestionChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.15), rgba(46, 204, 113, 0.1))',
  color: '#27ae60',
  border: '2px solid rgba(39, 174, 96, 0.4)',
  borderRadius: '25px',
  padding: '12px 20px',
  fontWeight: '600',
  fontSize: '1rem',
  height: 'auto',
  minHeight: '42px',
  backdropFilter: 'blur(15px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.25), rgba(46, 204, 113, 0.15))',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 20px rgba(39, 174, 96, 0.25)',
    border: '2px solid rgba(39, 174, 96, 0.6)',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: '28px',
  borderBottom: '2px solid rgba(46, 204, 113, 0.25)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 255, 249, 0.95))',
  backdropFilter: 'blur(15px)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, 16a085(46, 204, 113, 0.4), transparent)',
  },
}));

const LoadingDots = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  '& > div': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #16a085, #16a085)',
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
    <Container maxWidth="xl" sx={{ 
      mt: 4, 
      mb: 4,
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%)',
      minHeight: '100vh',
      padding: '25px'
    }}>
      <Zoom in={true} timeout={800}>
        <Typography 
          variant="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 6,
            background: 'linear-gradient(135deg, #16a085, #16a085, #16a085)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            fontWeight: '900',
            fontSize: { xs: '3rem', md: '4.5rem', lg: '5rem' },
            textShadow: '0 6px 20px rgba(39, 174, 96, 0.25)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-15px',
              left: '20%',
              right: '20%',
              height: '4px',
              background: 'linear-gradient(90deg, transparent, #16a085, transparent)',
              borderRadius: '3px',
            }
          }}
        >
          <AutoAwesome sx={{ 
            fontSize: '3.5rem', 
            mr: 3,
            background: 'linear-gradient(135deg, #16a085, #16a085)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }} />
          Assistant Immobilier Intelligent
        </Typography>
      </Zoom>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} xl={10}>
          <GlassChatContainer>
            <HeaderBox>
              <Typography variant="h3" sx={{ 
                color: '#16a085', 
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}>
                <SmartToy sx={{ fontSize: '2.5rem' }} />
                Conversation avec l'Expert
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#7f8c8d',
                mt: 2,
                fontSize: '1.1rem',
                fontWeight: '500'
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
                          lineHeight: '1.6',
                          fontSize: '1.1rem',
                          fontWeight: '500'
                        }}>
                          {message.text}
                        </Typography>
                      </MessageBubble>
                      <StyledAvatar isUser={true}>
                        <Person sx={{ fontSize: '1.8rem' }} />
                      </StyledAvatar>
                    </UserMessage>
                  ) : (
                    <BotMessage>
                      <StyledAvatar isUser={false}>
                        <SmartToy sx={{ fontSize: '1.8rem' }} />
                      </StyledAvatar>
                      <MessageBubble isUser={false}>
                        <Typography variant="body1" sx={{ 
                          whiteSpace: 'pre-line',
                          lineHeight: '1.7',
                          fontSize: '1.1rem',
                          fontWeight: '500'
                        }}>
                          {message.text}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#95a5a6', 
                          mt: 2, 
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '600'
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
                    <SmartToy sx={{ fontSize: '1.8rem' }} />
                  </StyledAvatar>
                  <MessageBubble isUser={false}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <LoadingDots>
                        <div></div>
                        <div></div>
                        <div></div>
                      </LoadingDots>
                      <Typography variant="h6" sx={{ color: '#7f8c8d', fontWeight: '600' }}>
                        Analyse en cours...
                      </Typography>
                    </Box>
                  </MessageBubble>
                </BotMessage>
              )}
              <div ref={messagesEndRef} />
            </MessageList>

            <Box sx={{ 
              p: 4, 
              borderTop: '2px solid rgba(46, 204, 113, 0.2)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 255, 249, 0.95))',
              backdropFilter: 'blur(15px)',
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 4, 
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
                gap: 3, 
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