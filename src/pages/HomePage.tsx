import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Work,
  People,
  TrendingUp,
  Speed,
  Security,
  Support,
  Search,
  Assignment,
  Event,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { state } = useAuth();

  const features = [
    {
      icon: <Work />,
      title: 'Job Management',
      description: 'Create, edit, and manage job postings with ease. Track applications and manage the entire recruitment pipeline.',
    },
    {
      icon: <People />,
      title: 'Applicant Tracking',
      description: 'Comprehensive applicant tracking system with status updates, notes, and rating capabilities.',
    },
    {
      icon: <Event />,
      title: 'Interview Scheduling',
      description: 'Schedule interviews, send automated reminders, and manage the entire interview process.',
    },
    {
      icon: <Assignment />,
      title: 'Resume Parsing',
      description: 'Automatically extract key information from resumes using AI-powered parsing technology.',
    },
    {
      icon: <TrendingUp />,
      title: 'Analytics Dashboard',
      description: 'Get insights into your recruitment process with comprehensive analytics and reporting.',
    },
    {
      icon: <Support />,
      title: 'AI Chatbot',
      description: 'Get instant answers to common questions with our intelligent chatbot assistant.',
    },
  ];

  const benefits = [
    {
      icon: <Speed />,
      title: 'Faster Hiring',
      description: 'Streamline your recruitment process and reduce time-to-hire by up to 50%.',
    },
    {
      icon: <Security />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and data protection.',
    },
    {
      icon: <Search />,
      title: 'Smart Matching',
      description: 'AI-powered candidate matching to find the best fit for your open positions.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Jobs Posted' },
    { number: '50,000+', label: 'Applications' },
    { number: '5,000+', label: 'Successful Hires' },
    { number: '1,000+', label: 'Companies' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Streamline Your Recruitment Process
              </Typography>
              <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
                A comprehensive MERN stack recruitment management system designed 
                to make hiring easier for recruiters and job searching simpler for candidates.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {state.isAuthenticated ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        backgroundColor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/jobs')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Browse Jobs
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography variant="h4" align="center" gutterBottom>
                    🚀 Modern Recruitment
                  </Typography>
                  <Typography variant="body1" align="center">
                    Built with cutting-edge technology for the modern workplace
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {stats.map((stat, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 45%', md: '1 1 22%' } }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Powerful Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to manage your recruitment process efficiently
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Avatar
                    sx={{
                      backgroundColor: 'primary.main',
                      mb: 2,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Why Choose Our Platform?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Built for modern recruitment teams
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {benefits.map((benefit, index) => (
              <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      backgroundColor: 'secondary.main',
                      mb: 2,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                    }}
                  >
                    {benefit.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Paper
          elevation={4}
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Ready to Transform Your Hiring Process?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of companies already using our platform
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!state.isAuthenticated && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/jobs')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Explore Jobs
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
