import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Work,
  Assignment,
  Event,
  Person,
  ExitToApp,
  Login,
  PersonAdd,
  Home,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const { state, logout } = useAuth();
  const { isAuthenticated, user } = state;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationItems = [
    { label: 'Home', path: '/', icon: <Home />, public: true },
    { label: 'Jobs', path: '/jobs', icon: <Work />, public: true },
  ];

  const authenticatedItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Interviews', path: '/interviews', icon: <Event /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
  ];

  const recruiterItems = [
    { label: 'My Jobs', path: '/jobs/my-jobs', icon: <Work /> },
    { label: 'Create Job', path: '/jobs/create', icon: <Work /> },
    { label: 'Applications', path: '/applications', icon: <Assignment /> },
  ];

  const applicantItems = [
    { label: 'My Applications', path: '/applications/my-applications', icon: <Assignment /> },
  ];

  const renderDesktopMenu = () => (
    <Box sx={{ 
      display: { xs: 'none', lg: 'flex' }, 
      alignItems: 'center', 
      gap: { lg: 1, xl: 2 },
      flexWrap: 'wrap'
    }}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          component={RouterLink}
          to={item.path}
          color="inherit"
          size="medium"
          sx={{
            backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
            minHeight: { lg: '40px', xl: '48px' },
            px: { lg: 1.5, xl: 2 },
            fontSize: { lg: '0.875rem', xl: '1rem' },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.15)',
            }
          }}
        >
          {item.label}
        </Button>
      ))}

      {isAuthenticated && (
        <>
          {authenticatedItems.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              color="inherit"
              size="medium"
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                minHeight: { lg: '40px', xl: '48px' },
                px: { lg: 1.5, xl: 2 },
                fontSize: { lg: '0.875rem', xl: '1rem' },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }
              }}
            >
              {item.label}
            </Button>
          ))}

          {(user?.role === 'recruiter' || user?.role === 'admin') &&
            recruiterItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                size="medium"
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                  minHeight: { lg: '40px', xl: '48px' },
                  px: { lg: 1.5, xl: 2 },
                  fontSize: { lg: '0.875rem', xl: '1rem' },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }
                }}
              >
                {item.label}
              </Button>
            ))}

          {user?.role === 'applicant' &&
            applicantItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                size="medium"
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                  minHeight: { lg: '40px', xl: '48px' },
                  px: { lg: 1.5, xl: 2 },
                  fontSize: { lg: '0.875rem', xl: '1rem' },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
        </>
      )}

      {isAuthenticated ? (
        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
          sx={{
            ml: { lg: 1, xl: 2 },
            minWidth: { lg: '40px', xl: '48px' },
            minHeight: { lg: '40px', xl: '48px' },
          }}
        >
          <Avatar sx={{ 
            width: { lg: 32, xl: 36 }, 
            height: { lg: 32, xl: 36 },
            fontSize: { lg: '0.875rem', xl: '1rem' }
          }}>
            {user?.firstName?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          gap: { lg: 1, xl: 1.5 },
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
            startIcon={<Login />}
            size="medium"
            sx={{
              minHeight: { lg: '40px', xl: '48px' },
              fontSize: { lg: '0.875rem', xl: '1rem' },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            color="inherit"
            variant="outlined"
            startIcon={<PersonAdd />}
            size="medium"
            sx={{ 
              borderColor: 'white', 
              minHeight: { lg: '40px', xl: '48px' },
              fontSize: { lg: '0.875rem', xl: '1rem' },
              '&:hover': { 
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              } 
            }}
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '280px', sm: '320px' },
          maxWidth: '85vw',
        },
      }}
    >
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Recruitment MS
        </Typography>
        {isAuthenticated && user && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Welcome, {user.firstName} {user.lastName}
          </Typography>
        )}
      </Box>
      <Divider />
      
      <List sx={{ py: 1 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={handleMobileMenuToggle}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
              minHeight: '56px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: location.pathname === item.path ? 600 : 400
              }}
            />
          </ListItem>
        ))}

        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Dashboard
              </Typography>
            </Box>
            {authenticatedItems.map((item) => (
              <ListItem
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={handleMobileMenuToggle}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
                  minHeight: '56px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: location.pathname === item.path ? 600 : 400
                  }}
                />
              </ListItem>
            ))}

            {(user?.role === 'recruiter' || user?.role === 'admin') && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Recruiter Tools
                  </Typography>
                </Box>
                {recruiterItems.map((item) => (
                  <ListItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleMobileMenuToggle}
                    sx={{
                      backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
                      minHeight: '56px',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.08)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: location.pathname === item.path ? 600 : 400
                      }}
                    />
                  </ListItem>
                ))}
              </>
            )}

            {user?.role === 'applicant' && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Job Seeker Tools
                  </Typography>
                </Box>
                {applicantItems.map((item) => (
                  <ListItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleMobileMenuToggle}
                    sx={{
                      backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
                      minHeight: '56px',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.08)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: location.pathname === item.path ? 600 : 400
                      }}
                    />
                  </ListItem>
                ))}
              </>
            )}

            <Divider sx={{ my: 1 }} />
            <ListItem 
              onClick={handleLogout}
              sx={{
                minHeight: '56px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}><ExitToApp /></ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: 'error.main'
                }}
              />
            </ListItem>
          </>
        )}

        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Account
              </Typography>
            </Box>
            <ListItem 
              component={RouterLink} 
              to="/login" 
              onClick={handleMobileMenuToggle}
              sx={{
                minHeight: '56px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}><Login /></ListItemIcon>
              <ListItemText 
                primary="Login" 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              />
            </ListItem>
            <ListItem 
              component={RouterLink} 
              to="/register" 
              onClick={handleMobileMenuToggle}
              sx={{
                minHeight: '56px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}><PersonAdd /></ListItemIcon>
              <ListItemText 
                primary="Register" 
                primaryTypographyProps={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  const renderProfileMenu = () => (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
        <Person sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ExitToApp sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                flexGrow: isMobile ? 1 : 0,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                '&:hover': {
                  opacity: 0.8,
                }
              }}
            >
              Recruitment MS
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {renderDesktopMenu()}
          </Toolbar>
        </Container>
      </AppBar>

      {renderMobileMenu()}
      {renderProfileMenu()}
    </>
  );
};

export default Navbar;
