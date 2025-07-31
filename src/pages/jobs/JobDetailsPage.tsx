import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  LocationOn,
  Work,
  Business,
  AttachMoney,
  Schedule,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { Job } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import JobApplicationForm from '../../components/applications/JobApplicationForm';

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJob(id!);

      if (response.success && response.data) {
        setJob(response.data);
        // Check if user has already applied (you might want to add this endpoint)
        // checkApplicationStatus();
      } else {
        setError(response.message || 'Failed to fetch job details');
      }
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      setError('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'applicant') {
      setError('Only applicants can apply for jobs');
      return;
    }

    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setHasApplied(true);
    // Optionally refresh job details to update application count
    fetchJobDetails();
  };

  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified';
    const { min, max, currency = 'USD', period = 'yearly' } = salary;
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)} ${period}`;
    } else if (min) {
      return `From ${formatAmount(min)} ${period}`;
    } else if (max) {
      return `Up to ${formatAmount(max)} ${period}`;
    }
    return 'Not specified';
  };

  const getLocationText = (location: any) => {
    if (typeof location === 'string') return location;
    if (location?.type === 'remote') return 'Remote';
    if (location?.type === 'hybrid') return `Hybrid - ${location.city || 'Location'}, ${location.state || ''}`;
    return `${location?.city || 'Location'}, ${location?.state || location?.country || ''}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            {error || 'Job not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

  const isDeadlinePassed = new Date() > new Date(job.applicationDeadline);
  const canApply = user?.role === 'applicant' && !hasApplied && !isDeadlinePassed && job.status === 'active';

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          {/* Job Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {job.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Business fontSize="small" color="action" />
              <Typography variant="h6" color="text.secondary">
                {typeof job.company === 'string' ? job.company : job.company.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {getLocationText(job.location)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {job.jobType?.replace('-', ' ')} • {job.experienceLevel} level
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatSalary(job.salary)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            {/* Apply Button */}
            <Box sx={{ mb: 3 }}>
              {canApply ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  onClick={handleApplyClick}
                  sx={{ mr: 2 }}
                >
                  Apply Now
                </Button>
              ) : hasApplied ? (
                <Button variant="outlined" disabled>
                  Already Applied
                </Button>
              ) : isDeadlinePassed ? (
                <Button variant="outlined" disabled>
                  Application Deadline Passed
                </Button>
              ) : user?.role !== 'applicant' ? (
                <Button variant="outlined" disabled>
                  Login as Applicant to Apply
                </Button>
              ) : (
                <Button variant="outlined" disabled>
                  Not Available
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Job Details Grid */}
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Job Description */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {job.description}
                </Typography>
              </Box>

              {/* Requirements */}
              {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {job.requirements.map((requirement: string, index: number) => (
                      <Typography component="li" key={index} variant="body1" sx={{ mb: 1 }}>
                        {requirement}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Responsibilities */}
              {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Responsibilities
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {job.responsibilities.map((responsibility: string, index: number) => (
                      <Typography component="li" key={index} variant="body1" sx={{ mb: 1 }}>
                        {responsibility}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Required Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.skills.map((skill: any, index: number) => (
                      <Chip
                        key={index}
                        label={typeof skill === 'string' ? skill : skill.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Benefits
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {job.benefits.map((benefit, index) => (
                      <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {benefit}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Job Info */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Job Type:</strong> {job.jobType?.replace('-', ' ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Experience Level:</strong> {job.experienceLevel}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Applications:</strong> {job.applicationsCount || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Application Form Dialog */}
        <Dialog
          open={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Apply for Position
            <IconButton onClick={() => setShowApplicationForm(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {job && (
              <JobApplicationForm
                job={job}
                onSuccess={handleApplicationSuccess}
                onCancel={() => setShowApplicationForm(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default JobDetailsPage;
