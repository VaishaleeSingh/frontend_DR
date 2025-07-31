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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          component={RouterLink}
          to={item.path}
          color="inherit"
          sx={{
            backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
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
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
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
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
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
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
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
        >
          <Avatar sx={{ width: 32, height: 32 }}>
            {user?.firstName?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
            startIcon={<Login />}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            color="inherit"
            variant="outlined"
            startIcon={<PersonAdd />}
            sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
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
          width: 250,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          RMS
        </Typography>
      </Box>
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={handleMobileMenuToggle}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}

        {isAuthenticated && (
          <>
            <Divider />
            {authenticatedItems.map((item) => (
              <ListItem
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={handleMobileMenuToggle}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            {(user?.role === 'recruiter' || user?.role === 'admin') && (
              <>
                <Divider />
                {recruiterItems.map((item) => (
                  <ListItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleMobileMenuToggle}
                    sx={{
                      backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </>
            )}

            {user?.role === 'applicant' && (
              <>
                <Divider />
                {applicantItems.map((item) => (
                  <ListItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleMobileMenuToggle}
                    sx={{
                      backgroundColor: location.pathname === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </>
            )}

            <Divider />
            <ListItem onClick={handleLogout}>
              <ListItemIcon><ExitToApp /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}

        {!isAuthenticated && (
          <>
            <Divider />
            <ListItem component={RouterLink} to="/login" onClick={handleMobileMenuToggle}>
              <ListItemIcon><Login /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem component={RouterLink} to="/register" onClick={handleMobileMenuToggle}>
              <ListItemIcon><PersonAdd /></ListItemIcon>
              <ListItemText primary="Register" />
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
