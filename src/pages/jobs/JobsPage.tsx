import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Work,
  AttachMoney,
  AccessTime,
  Business,
} from '@mui/icons-material';
import apiService from '../../services/api';
import { Job } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for jobs and loading
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState('');

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(locationFilter && { location: locationFilter }),
        ...(jobTypeFilter && { jobType: jobTypeFilter }),
        ...(experienceLevelFilter && { experienceLevel: experienceLevelFilter }),
        sortBy: 'createdAt',
        sortOrder: 'desc' as 'desc'
      };

      const response = await apiService.getJobs(params);

      if (response.success) {
        setJobs(response.data || []);
        setTotalJobs(response.pagination?.totalJobs || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs on component mount and when filters change
  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm, locationFilter, jobTypeFilter, experienceLevelFilter]);

  const formatSalary = (salary: any) => {
    if (!salary.min && !salary.max) return 'Salary not specified';

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: salary.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (salary.min && salary.max) {
      return `${formatAmount(salary.min)} - ${formatAmount(salary.max)} per ${salary.period}`;
    } else if (salary.min) {
      return `From ${formatAmount(salary.min)} per ${salary.period}`;
    } else {
      return `Up to ${formatAmount(salary.max)} per ${salary.period}`;
    }
  };

  const getLocationText = (location: { type: string; city?: string; state?: string; country?: string; address?: string }) => {
    if (location.type === 'remote') return 'Remote';
    if (location.type === 'hybrid') return `Hybrid - ${location.city || 'Location'}, ${location.state || ''}`;
    return `${location.city || 'Location'}, ${location.state || location.country || ''}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom>
          Find Your Dream Job
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Discover opportunities that match your skills and career goals
        </Typography>

        {/* Search and Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search jobs or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Location Type</InputLabel>
              <Select
                value={locationFilter}
                label="Location Type"
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="remote">Remote</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
                <MenuItem value="onsite">On-site</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={jobTypeFilter}
                label="Job Type"
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="full-time">Full-time</MenuItem>
                <MenuItem value="part-time">Part-time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Experience</InputLabel>
              <Select
                value={experienceLevelFilter}
                label="Experience"
                onChange={(e) => setExperienceLevelFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior Level</MenuItem>
                <MenuItem value="executive">Executive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Results Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">
                {totalJobs} job{totalJobs !== 1 ? 's' : ''} found
              </Typography>
            </Box>

            {/* Job Listings */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {jobs.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No jobs found matching your criteria
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your search filters or check back later for new opportunities
                  </Typography>
                </Paper>
              ) : (
                jobs.map((job) => (
            <Card
              key={job._id}
              elevation={2}
              sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
                border: job.featured ? '2px solid' : 'none',
                borderColor: job.featured ? 'primary.main' : 'transparent',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h5" component="h2">
                        {job.title}
                      </Typography>
                      {job.featured && (
                        <Chip label="Featured" color="primary" size="small" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="subtitle1" color="text.secondary">
                        {job.company.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {getLocationText(job.location)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Work fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {job.jobType?.replace('-', ' ')} • {job.experienceLevel} level
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatSalary(job.salary)}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {job.description}
                </Typography>

                {job.skills && job.skills.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {job.skills.slice(0, 5).map((skill: any, index: number) => (
                      <Chip
                        key={index}
                        label={typeof skill === 'string' ? skill : skill.name}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    ))}
                    {job.skills.length > 5 && (
                      <Chip label={`+${job.skills.length - 5} more`} size="small" variant="outlined" />
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Posted {formatDate(job.createdAt)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Deadline: {formatDate(job.applicationDeadline)}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  View Details
                </Button>
                {user?.role === 'applicant' && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    Apply Now
                  </Button>
                )}
              </CardActions>
            </Card>
                ))
              )}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default JobsPage;
