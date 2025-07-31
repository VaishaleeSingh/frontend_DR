import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Chat as ChatIcon,
  Refresh,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${user?.firstName || 'there'}! I'm your AI recruitment assistant. I can help you with job search, application tips, interview preparation, and more. What would you like to know?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('job') || lowerMessage.includes('position') || lowerMessage.includes('career')) {
      return "I can help you find job opportunities! You can browse available positions in the Jobs section. Would you like me to guide you through the application process or help you prepare your resume?";
    }
    
    if (lowerMessage.includes('apply') || lowerMessage.includes('application') || lowerMessage.includes('submit')) {
      return "To apply for a job, simply click on the job posting and use the 'Apply Now' button. Make sure to upload your resume and write a compelling cover letter. Would you like tips on writing a great cover letter?";
    }
    
    if (lowerMessage.includes('interview') || lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
      return "Interviews are typically scheduled by recruiters after reviewing your application. You can check your interview status in the Interviews section. Would you like some interview preparation tips?";
    }
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('profile')) {
      return "You can update your resume and profile information in the Profile section. A good resume should highlight your skills, experience, and achievements. Would you like resume writing tips?";
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('track') || lowerMessage.includes('check')) {
      return "You can track your application status in the 'My Applications' section. This will show you whether your application is pending, under review, or if an interview has been scheduled.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
      return "I'm here to help! I can assist with job searching, application processes, interview preparation, resume tips, and tracking your application status. What specific area would you like help with?";
    }
    
    return "I understand you're asking about recruitment. I can help with job searching, applications, interviews, resume tips, and more. Could you please be more specific about what you'd like to know?";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputText),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I apply for a job?",
    "How can I track my application?",
    "Interview preparation tips",
    "Resume writing help",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <ChatIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1">
              AI Recruitment Assistant
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get instant help with your recruitment questions
            </Typography>
          </Box>
        </Box>

        <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography variant="h6">AI Assistant</Typography>
                  <Typography variant="caption">Online • Ready to help</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <List sx={{ p: 0 }}>
                {messages.map((message) => (
                  <ListItem
                    key={message.id}
                    sx={{
                      flexDirection: 'column',
                      alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      p: 0,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        maxWidth: '70%',
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                          color: message.sender === 'user' ? 'white' : 'text.secondary',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {message.sender === 'user' ? <Person /> : <SmartToy />}
                      </Avatar>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.50',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1">{message.text}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </ListItem>
                ))}
                
                {isTyping && (
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 0, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'grey.100', color: 'text.secondary', width: 32, height: 32 }}>
                        <SmartToy />
                      </Avatar>
                      <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">
                            AI is typing...
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </ListItem>
                )}
              </List>
              <div ref={messagesEndRef} />
            </Box>

            {messages.length === 1 && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick questions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quickQuestions.map((question) => (
                    <Chip
                      key={question}
                      label={question}
                      variant="outlined"
                      size="small"
                      clickable
                      onClick={() => handleQuickQuestion(question)}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <Send />
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> You can ask me about job applications, interview preparation, resume tips, 
            application tracking, and more. I'm here to help make your recruitment process smoother!
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default ChatbotPage; 