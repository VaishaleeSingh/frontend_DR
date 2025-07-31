import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { Application } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, jobFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      if (statusFilter) params.status = statusFilter;
      if (jobFilter) params.jobId = jobFilter;

      const response = await apiService.getApplications(params);

      if (response.success) {
        setApplications(response.data || []);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await apiService.updateApplicationStatus(applicationId, newStatus);

      if (response.success) {
        // Update the application in the list
        setApplications(prev =>
          prev.map(app =>
            app._id === applicationId
              ? { ...app, status: newStatus as any }
              : app
          )
        );
        setAnchorEl(null);
      } else {
        setError(response.message || 'Failed to update application status');
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'shortlisted':
        return 'primary';
      case 'interview_scheduled':
        return 'secondary';
      case 'interviewed':
        return 'secondary';
      case 'hired':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, application: Application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Job Applications
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage applications for your job postings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="shortlisted">Shortlisted</MenuItem>
                <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                <MenuItem value="interviewed">Interviewed</MenuItem>
                <MenuItem value="hired">Hired</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setJobFilter('');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>

        {/* Applications Table */}
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Job Position</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No applications found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow
                      key={application._id}
                      hover
                      onClick={() => navigate(`/applications/${application._id}`)}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {application.applicant.firstName[0]}{application.applicant.lastName[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {application.applicant.firstName} {application.applicant.lastName}
                              <ViewIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.applicant.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {application.job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {typeof application.job.company === 'string'
                            ? application.job.company
                            : application.job.company.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={application.status.replace('_', ' ')}
                          color={getStatusColor(application.status) as any}
                          size="small"
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusFilter(application.status);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(application.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click when clicking the button
                              navigate(`/applications/${application._id}`);
                            }}
                            startIcon={<ViewIcon />}
                          >
                            View
                          </Button>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click when clicking the button
                              handleMenuClick(e, application);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedApplication) {
              navigate(`/applications/${selectedApplication._id}`);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

          {selectedApplication?.resume && (
            <MenuItem onClick={async () => {
              // Download resume
              if (selectedApplication) {
                try {
                  const blob = await apiService.downloadResume(selectedApplication._id);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `resume_${selectedApplication.applicant.firstName}_${selectedApplication.applicant.lastName}.${selectedApplication.resume.originalName.split('.').pop() || 'pdf'}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error: any) {
                  console.error('Error downloading resume:', error);
                  // You might want to show a snackbar or alert here
                  alert(error.message || 'Failed to download resume');
                }
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Download Resume</ListItemText>
            </MenuItem>
          )}

          {selectedApplication?.status === 'submitted' && (
            <MenuItem onClick={() => {
              if (selectedApplication) {
                handleStatusUpdate(selectedApplication._id, 'under_review');
              }
            }}>
              <ListItemIcon>
                <ScheduleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mark as Under Review</ListItemText>
            </MenuItem>
          )}

          {(selectedApplication?.status === 'submitted' || selectedApplication?.status === 'under_review') && (
            <MenuItem onClick={() => {
              if (selectedApplication) {
                handleStatusUpdate(selectedApplication._id, 'shortlisted');
              }
            }}>
              <ListItemIcon>
                <ApproveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Shortlist</ListItemText>
            </MenuItem>
          )}

          {selectedApplication?.status === 'shortlisted' && (
            <MenuItem onClick={() => {
              if (selectedApplication) {
                // Navigate to interviews page with pre-filled application
                navigate('/interviews', { 
                  state: { 
                    prefillApplication: selectedApplication._id 
                  } 
                });
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                <ScheduleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Schedule Interview</ListItemText>
            </MenuItem>
          )}

          {selectedApplication?.status !== 'rejected' && selectedApplication?.status !== 'hired' && (
            <MenuItem onClick={() => {
              if (selectedApplication) {
                handleStatusUpdate(selectedApplication._id, 'rejected');
              }
            }}>
              <ListItemIcon>
                <RejectIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Container>
  );
};

export default ApplicationsPage;
