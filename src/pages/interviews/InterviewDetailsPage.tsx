import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Notes as NotesIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';


import { apiService } from '../../services/api';
import { Interview, Application, Job } from '../../types';

interface InterviewWithDetails extends Omit<Interview, 'application' | 'job' | 'applicant' | 'interviewer'> {
  application?: Application;
  job?: Job;
  applicant?: any;
  interviewer?: any;
}

const InterviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [interview, setInterview] = useState<InterviewWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    scheduledDate: null as Date | null,
    scheduledTime: null as Date | null,
    type: 'video' as 'video' | 'phone' | 'in-person',
    location: '',
    notes: '',
    duration: 60,
  });

  // Status update state
  const [newStatus, setNewStatus] = useState<string>('');

  // Fetch interview details
  const fetchInterviewDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get(`/interviews/${id}`);
      if (response.success) {
        setInterview(response.data.interview);
      } else {
        setError('Failed to fetch interview details');
      }
    } catch (err) {
      setError('Error loading interview details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id, fetchInterviewDetails]);

  // Handle edit interview
  const handleEditInterview = async () => {
    if (!interview || !editForm.scheduledDate || !editForm.scheduledTime) {
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

      const response = await apiService.put(`/interviews/${interview._id}`, updateData);

      if (response.success) {
        setEditDialogOpen(false);
        fetchInterviewDetails();
      } else {
        setError('Failed to update interview');
      }
    } catch (err) {
      setError('Error updating interview');
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!interview || !newStatus) return;

    try {
      const response = await apiService.patch(`/interviews/${interview._id}/status`, {
        status: newStatus,
      });

      if (response.success) {
        setStatusDialogOpen(false);
        setNewStatus('');
        fetchInterviewDetails();
      } else {
        setError('Failed to update interview status');
      }
    } catch (err) {
      setError('Error updating interview status');
    }
  };

  // Handle delete interview
  const handleDeleteInterview = async () => {
    if (!interview) return;

    if (!window.confirm('Are you sure you want to delete this interview?')) {
      return;
    }

    try {
      const response = await apiService.delete(`/interviews/${interview._id}`);
      if (response.success) {
        navigate('/interviews');
      } else {
        setError('Failed to delete interview');
      }
    } catch (err) {
      setError('Error deleting interview');
    }
  };

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

  // Get status steps
  const getStatusSteps = () => {
    const steps = [
      { label: 'Scheduled', status: 'scheduled' },
      { label: 'Confirmed', status: 'confirmed' },
      { label: 'In Progress', status: 'in_progress' },
      { label: 'Completed', status: 'completed' },
    ];

    const currentIndex = steps.findIndex(step => step.status === interview?.status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !interview) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Interview not found'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/interviews')}
          >
            Back to Interviews
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/interviews')}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h3" component="h1">
          Interview Details
        </Typography>
              <Typography variant="h6" color="text.secondary">
                {interview.job?.title} - {interview.applicant?.firstName} {interview.applicant?.lastName}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setStatusDialogOpen(true)}
            >
              Update Status
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
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
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteInterview}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Main Interview Info */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Interview Information
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <EventIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {format(parseISO(interview.scheduledDate), 'EEEE, MMMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <TimeIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Time
                        </Typography>
                        <Typography variant="body1">
                          {format(parseISO(interview.scheduledDate), 'hh:mm a')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {getTypeIcon(interview.type)}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {interview.type}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <TimeIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {interview.duration} minutes
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {interview.location && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <LocationIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Location/Link
                          </Typography>
                          <Typography variant="body1">
                            {interview.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {interview.notes && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <NotesIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Notes
                          </Typography>
                          <Typography variant="body1">
                            {interview.notes}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Status Stepper */}
                <Typography variant="h6" gutterBottom>
                  Interview Progress
                </Typography>
                <Stepper orientation="vertical">
                  {getStatusSteps().map((step, index) => (
                    <Step key={step.status} active={step.active} completed={step.completed}>
                      <StepLabel
                        icon={step.completed ? <CheckIcon /> : index + 1}
                        color={step.active ? 'primary' : step.completed ? 'success' : 'disabled'}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Status Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={interview.status.replace('_', ' ')}
                  color={getStatusColor(interview.status) as any}
                  size="medium"
                  sx={{ textTransform: 'capitalize' }}
                />
              </CardContent>
            </Card>

            {/* Applicant Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Applicant
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {interview.applicant?.firstName} {interview.applicant?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interview.applicant?.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Job Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Position
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <WorkIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {interview.job?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interview.job?.company?.name}
        </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Edit Interview Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Interview</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box>
                  <TextField
                    label="Interview Date"
                    type="date"
                    value={editForm.scheduledDate ? format(editForm.scheduledDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setEditForm(prev => ({ ...prev, scheduledDate: date }));
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box>
                  <TextField
                    label="Interview Time"
                    type="time"
                    value={editForm.scheduledTime ? format(editForm.scheduledTime, 'HH:mm') : ''}
                    onChange={(e) => {
                      const time = e.target.value ? new Date(`2000-01-01T${e.target.value}`) : null;
                      setEditForm(prev => ({ ...prev, scheduledTime: time }));
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
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

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Interview Status</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  label="New Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no_show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} variant="contained">Update Status</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default InterviewDetailsPage;
