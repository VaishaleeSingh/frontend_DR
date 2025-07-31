import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  ListSubheader,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Interview, Application, Job } from '../../types';

interface InterviewWithDetails extends Omit<Interview, 'application' | 'job' | 'applicant'> {
  application?: Application;
  job?: Job;
  applicant?: any;
}

const InterviewsPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();

  // State
  const [interviews, setInterviews] = useState<InterviewWithDetails[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [applicationSearch, setApplicationSearch] = useState<string>('');
  const [showAllApplications, setShowAllApplications] = useState<boolean>(true); // For debugging - enabled by default

  // Dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithDetails | null>(null);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    scheduledDate: null as Date | null,
    scheduledTime: null as Date | null,
    type: 'video' as 'video' | 'phone' | 'in-person',
    location: '',
    notes: '',
    duration: 60,
  });

  const [editForm, setEditForm] = useState({
    scheduledDate: null as Date | null,
    scheduledTime: null as Date | null,
    type: 'video' as 'video' | 'phone' | 'in-person',
    location: '',
    notes: '',
    duration: 60,
  });

  // Fetch interviews
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching interviews...');
      const response = await apiService.get('/interviews');
      console.log('Interviews response:', response);
      
      if (response.success) {
        const interviewsData = response.data.interviews || response.data || [];
        console.log('Setting interviews:', interviewsData);
        setInterviews(interviewsData);
      } else {
        console.error('Failed to fetch interviews:', response.message);
        setError('Failed to fetch interviews');
      }
    } catch (err) {
      console.error('Error loading interviews:', err);
      setError('Error loading interviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications for scheduling
  const fetchApplications = useCallback(async () => {
    try {
      console.log('Fetching applications...');
      console.log('Current user role:', user?.role);
      
      // Use different endpoints based on user role
      let endpoint = '/applications?limit=100';
      if (user?.role === 'applicant') {
        endpoint = '/applications/my-applications?limit=100';
      }
      
      const response = await apiService.get(endpoint);
      console.log('Applications response:', response);
      
      if (response.success) {
        const applicationsData = response.data.applications || response.data || [];
        console.log('All applications:', applicationsData);
        
        // Filter applications that can be scheduled for interviews
        let schedulableApplications;
        
        if (showAllApplications) {
          // Show all applications for debugging
          schedulableApplications = applicationsData;
          console.log('Showing ALL applications for debugging');
        } else {
          // Normal filtering
          schedulableApplications = applicationsData.filter((app: any) => {
            const isSchedulableStatus = ['applied', 'shortlisted', 'under_review', 'selected', 'pending'].includes(app.status);
            const hasNoInterview = !app.interview;
            console.log(`Application ${app._id}: status=${app.status}, hasInterview=${!!app.interview}, schedulable=${isSchedulableStatus && hasNoInterview}`);
            return isSchedulableStatus && hasNoInterview;
          });
        }
        
        setApplications(schedulableApplications || []);
        console.log('Available applications for scheduling:', schedulableApplications.length);
        console.log('Schedulable applications:', schedulableApplications);
        console.log('showAllApplications state:', showAllApplications);
        console.log('Final applications state that will be set:', schedulableApplications);
        
        // Clear any previous errors if we successfully fetched applications
        if (error && error.includes('Failed to fetch applications')) {
          setError(null);
        }
      } else {
        console.error('Failed to fetch applications:', response.message);
        setError(`Failed to fetch applications: ${response.message}`);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Error fetching applications. Please try again.');
    }
  }, [user?.role, showAllApplications, error]);

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, [fetchApplications]); // Initial load

  // Re-fetch applications when showAllApplications changes
  useEffect(() => {
    if (applications.length > 0) { // Only re-fetch if we already have applications
      fetchApplications();
    }
  }, [showAllApplications, applications.length, fetchApplications]);

  // Monitor applications state changes
  useEffect(() => {
    console.log('Applications state changed:', applications);
    console.log('Applications length:', applications.length);
  }, [applications]);

  // Handle schedule interview
  const handleScheduleInterview = async () => {
    if (!scheduleForm.applicationId || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time
      const scheduledDateTime = new Date(
        scheduleForm.scheduledDate.getFullYear(),
        scheduleForm.scheduledDate.getMonth(),
        scheduleForm.scheduledDate.getDate(),
        scheduleForm.scheduledTime.getHours(),
        scheduleForm.scheduledTime.getMinutes()
      );

      const interviewData = {
        applicationId: scheduleForm.applicationId,
        scheduledDate: scheduledDateTime.toISOString(),
        type: scheduleForm.type,
        location: scheduleForm.location,
        notes: scheduleForm.notes,
        duration: scheduleForm.duration,
      };

      const response = await apiService.post('/interviews', interviewData);

      if (response.success) {
        setScheduleDialogOpen(false);
        setScheduleForm({
          applicationId: '',
          scheduledDate: null,
          scheduledTime: null,
          type: 'video',
          location: '',
          notes: '',
          duration: 60,
        });
        fetchInterviews(); // Refresh the list
      } else {
        setError('Failed to schedule interview');
      }
    } catch (err) {
      setError('Error scheduling interview');
    }
  };

  // Handle edit interview
  const handleEditInterview = async () => {
    if (!selectedInterview || !editForm.scheduledDate || !editForm.scheduledTime) {
      return;
    }

    try {
      const scheduledDateTime = new Date(
        editForm.scheduledDate.getFullYear(),
        editForm.scheduledDate.getMonth(),
        editForm.scheduledDate.getDate(),
        editForm.scheduledTime.getHours(),
        editForm.scheduledTime.getMinutes()
      );

      const updateData = {
        scheduledDate: scheduledDateTime.toISOString(),
        type: editForm.type,
        location: editForm.location,
        notes: editForm.notes,
        duration: editForm.duration,
      };

      const response = await apiService.put(`/interviews/${selectedInterview._id}`, updateData);

      if (response.success) {
        setEditDialogOpen(false);
        setSelectedInterview(null);
        fetchInterviews();
      } else {
        setError('Failed to update interview');
      }
    } catch (err) {
      setError('Error updating interview');
    }
  };

  // Handle delete interview
  const handleDeleteInterview = async (interviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this interview?')) {
      return;
    }

    try {
      const response = await apiService.delete(`/interviews/${interviewId}`);
      if (response.success) {
        fetchInterviews();
      } else {
        setError('Failed to delete interview');
      }
    } catch (err) {
      setError('Error deleting interview');
    }
  };

  // Handle status update


  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'confirmed': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no_show': return 'error';
      default: return 'default';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCallIcon />;
      case 'phone': return <PhoneIcon />;
      case 'in-person': return <LocationIcon />;
      default: return <EventIcon />;
    }
  };

  // Filter applications based on search
  const getFilteredApplications = () => {
    console.log('getFilteredApplications called');
    console.log('applications array:', applications);
    console.log('applicationSearch:', applicationSearch);
    
    if (!applicationSearch.trim()) {
      console.log('No search term, returning all applications:', applications.length);
      return applications;
    }
    
    const searchTerm = applicationSearch.toLowerCase();
    const filtered = applications.filter(app => {
      const companyName = typeof app.job?.company === 'string' 
        ? app.job.company 
        : app.job?.company?.name;
      
      const matches = (
        app.applicant?.firstName?.toLowerCase().includes(searchTerm) ||
        app.applicant?.lastName?.toLowerCase().includes(searchTerm) ||
        app.job?.title?.toLowerCase().includes(searchTerm) ||
        companyName?.toLowerCase().includes(searchTerm) ||
        app.status?.toLowerCase().includes(searchTerm)
      );
      
      console.log(`Application ${app._id}: matches search = ${matches}`);
      return matches;
    });
    
    console.log('Filtered applications:', filtered.length);
    return filtered;
  };

  // Filter interviews
  const filteredInterviews = interviews.filter(interview => {
    if (statusFilter === 'all') return true;
    return interview.status === statusFilter;
  });

  console.log('Total interviews:', interviews.length);
  console.log('Filtered interviews:', filteredInterviews.length);
  console.log('Status filter:', statusFilter);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ScheduleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h3" component="h1">
          Interviews
        </Typography>
                <Typography variant="h6" color="text.secondary">
                  Manage and schedule interviews
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchInterviews}
              >
                Refresh
              </Button>
              {/* Only show Schedule Interview button for recruiters and admins */}
              {(user?.role === 'recruiter' || user?.role === 'admin') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  Schedule Interview
                </Button>
              )}
              {/* Show disabled button for applicants */}
              {user?.role === 'applicant' && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled
                  title="Only recruiters and administrators can schedule interviews"
                >
                  Schedule Interview
                </Button>
              )}
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Show message for applicants */}
          {user?.role === 'applicant' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              As an applicant, you can view your interviews here. Only recruiters and administrators can schedule interviews.
            </Alert>
          )}

          {/* Show message when no applications available for scheduling */}
          {applications.length === 0 && (user?.role === 'recruiter' || user?.role === 'admin') && !error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              No applications available for scheduling interviews. Applications will appear here once candidates apply for your posted jobs.
            </Alert>
          )}

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FilterIcon color="action" />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="no_show">No Show</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>

          {/* Interviews Table */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Applicant</TableCell>
                      <TableCell>Job</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInterviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                            <Typography variant="h6" color="text.secondary">
                              No interviews found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {statusFilter === 'all' 
                                ? 'No interviews have been scheduled yet.'
                                : `No interviews with status "${statusFilter}" found.`
                              }
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => setScheduleDialogOpen(true)}
                              sx={{ mt: 1 }}
                            >
                              Schedule Your First Interview
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInterviews.map((interview) => (
                        <TableRow key={interview._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {interview.applicant?.firstName} {interview.applicant?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {interview.applicant?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {interview.job?.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {interview.job?.company?.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {format(parseISO(interview.scheduledDate), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(interview.scheduledDate), 'hh:mm a')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTypeIcon(interview.type)}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {interview.type}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={interview.status.replace('_', ' ')}
                            color={getStatusColor(interview.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/interviews/${interview._id}`)}
                                color="primary"
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setEditForm({
                                    scheduledDate: parseISO(interview.scheduledDate),
                                    scheduledTime: parseISO(interview.scheduledDate),
                                    type: interview.type as any,
                                    location: interview.location || '',
                                    notes: interview.notes || '',
                                    duration: interview.duration,
                                  });
                                  setEditDialogOpen(true);
                                }}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteInterview(interview._id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Schedule Interview Dialog */}
          <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Box>
                <Typography variant="h6">Schedule Interview</Typography>
                <Typography variant="body2" color="text.secondary">
                  {applications.length > 0 
                    ? `${getFilteredApplications().length} of ${applications.length} applications available`
                    : 'No applications available for scheduling'
                  }
                </Typography>
                {user?.role === 'applicant' && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    Note: Only recruiters and administrators can schedule interviews
                  </Typography>
                )}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                {/* Search Applications */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Search Applications"
                    value={applicationSearch}
                    onChange={(e) => setApplicationSearch(e.target.value)}
                    fullWidth
                    placeholder="Search by applicant name, job title, company, or status..."
                    InputProps={{
                      startAdornment: <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchApplications}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Refresh
                  </Button>
                </Box>
                
                {/* Debug Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Show all applications (debug):
                  </Typography>
                  <Button
                    variant={showAllApplications ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setShowAllApplications(!showAllApplications);
                      fetchApplications(); // Re-fetch with new setting
                    }}
                  >
                    {showAllApplications ? "ON" : "OFF"}
                  </Button>
                </Box>
                
                <FormControl fullWidth>
                  <InputLabel>Select Application</InputLabel>
                  <Select
                    value={scheduleForm.applicationId}
                    label="Select Application"
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, applicationId: e.target.value }))}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {(() => {
                      const filteredApps = getFilteredApplications();
                      console.log('Rendering dropdown with filtered apps:', filteredApps.length);
                      console.log('Total applications:', applications.length);
                      
                      if (filteredApps.length === 0) {
                        return (
                          <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                              {applications.length === 0 
                                ? 'No applications available for scheduling interviews'
                                : 'No applications match your search criteria'
                              }
                            </Typography>
                          </MenuItem>
                        );
                      }
                      
                      return [
                        // Group by status
                        ...['shortlisted', 'under_review', 'applied', 'selected', 'pending'].map(status => {
                          const statusApplications = filteredApps.filter(app => app.status === status);
                          if (statusApplications.length === 0) return null;
                          
                          return [
                            <ListSubheader key={`header-${status}`} sx={{ 
                              bgcolor: 'grey.100', 
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              fontSize: '0.75rem'
                            }}>
                              {status.replace('_', ' ')} ({statusApplications.length})
                            </ListSubheader>,
                            ...statusApplications.map((app) => (
                              <MenuItem key={app._id} value={app._id} sx={{ pl: 3 }}>
                                <Box sx={{ width: '100%' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {app.applicant?.firstName} {app.applicant?.lastName}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {`${app.job?.title || 'N/A'} • ${typeof app.job?.company === 'string' ? app.job.company : app.job?.company?.name || 'N/A'}`}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
        </Typography>
                                    </Box>
                                    <Chip 
                                      label={app.status.replace('_', ' ')} 
                                      size="small" 
                                      color={app.status === 'shortlisted' ? 'success' : app.status === 'under_review' ? 'warning' : 'default'}
                                      sx={{ ml: 1 }}
                                    />
                                  </Box>
                                </Box>
                              </MenuItem>
                            ))
                          ];
                        }).filter(Boolean).flat()
                      ];
                    })()}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box>
                    <DatePicker
                      label="Interview Date"
                      value={scheduleForm.scheduledDate}
                      onChange={(newValue) => setScheduleForm(prev => ({ ...prev, scheduledDate: newValue }))}
                      enableAccessibleFieldDOMStructure={false}
                      slots={{
                        textField: TextField
                      }}
                      slotProps={{
                        textField: { fullWidth: true }
                      }}
                    />
                  </Box>
                  <Box>
                    <TimePicker
                      label="Interview Time"
                      value={scheduleForm.scheduledTime}
                      onChange={(newValue) => setScheduleForm(prev => ({ ...prev, scheduledTime: newValue }))}
                      enableAccessibleFieldDOMStructure={false}
                      slots={{
                        textField: TextField
                      }}
                      slotProps={{
                        textField: { fullWidth: true }
                      }}
                    />
                  </Box>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Interview Type</InputLabel>
                  <Select
                    value={scheduleForm.type}
                    label="Interview Type"
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <MenuItem value="video">Video Call</MenuItem>
                    <MenuItem value="phone">Phone Call</MenuItem>
                    <MenuItem value="in-person">In Person</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Location/Meeting Link"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                  fullWidth
                  placeholder={scheduleForm.type === 'video' ? 'Meeting link (Zoom, Teams, etc.)' : 'Office address'}
                />

                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={scheduleForm.duration}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  fullWidth
                />

                <TextField
                  label="Notes"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Additional notes for the interview..."
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleScheduleInterview} variant="contained">Schedule Interview</Button>
            </DialogActions>
          </Dialog>

          {/* Edit Interview Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Interview</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box>
                    <DatePicker
                      label="Interview Date"
                      value={editForm.scheduledDate}
                      onChange={(newValue) => setEditForm(prev => ({ ...prev, scheduledDate: newValue }))}
                      enableAccessibleFieldDOMStructure={false}
                      slots={{
                        textField: TextField
                      }}
                      slotProps={{
                        textField: { fullWidth: true }
                      }}
                    />
                  </Box>
                  <Box>
                    <TimePicker
                      label="Interview Time"
                      value={editForm.scheduledTime}
                      onChange={(newValue) => setEditForm(prev => ({ ...prev, scheduledTime: newValue }))}
                      enableAccessibleFieldDOMStructure={false}
                      slots={{
                        textField: TextField
                      }}
                      slotProps={{
                        textField: { fullWidth: true }
                      }}
                    />
                  </Box>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Interview Type</InputLabel>
                  <Select
                    value={editForm.type}
                    label="Interview Type"
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <MenuItem value="video">Video Call</MenuItem>
                    <MenuItem value="phone">Phone Call</MenuItem>
                    <MenuItem value="in-person">In Person</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Location/Meeting Link"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  fullWidth
                />

                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  fullWidth
                />

                <TextField
                  label="Notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditInterview} variant="contained">Update Interview</Button>
            </DialogActions>
          </Dialog>
      </Box>
    </Container>
    </LocalizationProvider>
  );
};

export default InterviewsPage;
