import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  LinkedIn,
  Twitter,
  Facebook,
  GitHub,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Company Info */}
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              Recruitment MS
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              A comprehensive recruitment management system designed to streamline 
              the hiring process for both recruiters and job seekers.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="LinkedIn"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Twitter"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="GitHub"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub />
              </IconButton>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link href="/jobs" color="inherit" underline="hover">
                Browse Jobs
              </Link>
              <Link href="/register" color="inherit" underline="hover">
                Create Account
              </Link>
              <Link href="/login" color="inherit" underline="hover">
                Login
              </Link>
            </Box>
          </Box>

          {/* For Recruiters */}
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              For Recruiters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/jobs/create" color="inherit" underline="hover">
                Post a Job
              </Link>
              <Link href="/dashboard" color="inherit" underline="hover">
                Recruiter Dashboard
              </Link>
              <Link href="/applications" color="inherit" underline="hover">
                Manage Applications
              </Link>
              <Link href="/interviews" color="inherit" underline="hover">
                Schedule Interviews
              </Link>
            </Box>
          </Box>

          {/* Contact Info */}
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  support@recruitmentms.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  123 Business Ave, Suite 100<br />
                  City, State 12345
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
            <Typography variant="body2">
              © {currentYear} Recruitment Management System. All rights reserved.
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 2,
              }}
            >
              <Link href="/privacy" color="inherit" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Terms of Service
              </Link>
              <Link href="/cookies" color="inherit" underline="hover">
                Cookie Policy
              </Link>
            </Box>
          </Box>
        </Box>

        {/* Additional Info */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Built with React, Node.js, MongoDB, and Material-UI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
