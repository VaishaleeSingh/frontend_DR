import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Work,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Pause,
  PlayArrow,
  Assignment,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { Job } from '../../types';

const MyJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Fetch recruiter's jobs
  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as 'desc'
      };

      const response = await apiService.getMyJobs(params);
      
      if (response.success) {
        setJobs(response.data || []);
        setTotalJobs(response.pagination?.totalJobs || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError('Failed to fetch your jobs');
      }
    } catch (err) {
      console.error('Error fetching my jobs:', err);
      setError('Failed to load your jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [currentPage]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: Job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    try {
      await apiService.deleteJob(jobToDelete._id);
      setJobs(jobs.filter(job => job._id !== jobToDelete._id));
      setTotalJobs(totalJobs - 1);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'closed': return 'error';
      case 'filled': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayArrow />;
      case 'paused': return <Pause />;
      case 'closed': return <Delete />;
      case 'filled': return <Assignment />;
      default: return <Work />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              My Job Postings
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your job listings and track applications
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Work />}
            onClick={() => navigate('/jobs/create')}
          >
            Post New Job
          </Button>
        </Box>

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
                {totalJobs} job{totalJobs !== 1 ? 's' : ''} posted
              </Typography>
            </Box>

            {/* Job Listings */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {jobs.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No jobs posted yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start by creating your first job posting to attract top talent
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Work />}
                    onClick={() => navigate('/jobs/create')}
                  >
                    Post Your First Job
                  </Button>
                </Paper>
              ) : (
                jobs.map((job) => (
                  <Card key={job._id} elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h5" component="h2">
                              {job.title}
                            </Typography>
                            <Chip
                              label={job.status}
                              color={getStatusColor(job.status) as any}
                              size="small"
                              icon={getStatusIcon(job.status)}
                            />
                            {job.featured && (
                              <Chip label="Featured" color="primary" size="small" />
                            )}
                          </Box>
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {typeof job.company === 'string' ? job.company : job.company.name} • {typeof job.location === 'string' ? job.location : (job.location.city || 'Remote')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {job.description.substring(0, 200)}...
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, job)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${job.applicationsCount || 0} applications`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${job.viewsCount || 0} views`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Assignment />}
                        onClick={() => navigate(`/jobs/${job._id}/applications`)}
                      >
                        Applications ({job.applicationsCount || 0})
                      </Button>
                    </CardActions>
                  </Card>
                ))
              )}
            </Box>
          </>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedJob) navigate(`/jobs/${selectedJob._id}`);
            handleMenuClose();
          }}>
            <Visibility sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedJob) navigate(`/jobs/${selectedJob._id}/edit`);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            Edit Job
          </MenuItem>
          <MenuItem onClick={() => selectedJob && handleDeleteClick(selectedJob)}>
            <Delete sx={{ mr: 1 }} />
            Delete Job
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Job Posting</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyJobsPage;
