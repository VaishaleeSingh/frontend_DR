import React from 'react';
import { Container, Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Work as WorkIcon, Add as AddIcon } from '@mui/icons-material';
import CreateJobForm from '../components/jobs/CreateJobForm';
import { useAuth } from '../contexts/AuthContext';

const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not recruiter or admin
  React.useEffect(() => {
    if (user && user.role !== 'recruiter' && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    navigate('/jobs/my-jobs');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Dashboard
        </Link>
        <Link
          color="inherit"
          href="/jobs"
          onClick={(e) => {
            e.preventDefault();
            navigate('/jobs');
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <WorkIcon fontSize="small" />
          Jobs
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AddIcon fontSize="small" />
          Create Job
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Post a New Job
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Fill out the form below to create a new job posting. Make sure to provide detailed information 
          to attract the right candidates.
        </Typography>
      </Box>

      {/* Create Job Form */}
      <CreateJobForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </Container>
  );
};

export default CreateJobPage;
