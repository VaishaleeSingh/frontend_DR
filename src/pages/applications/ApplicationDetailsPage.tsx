import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Application } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getApplication(id!);
      
      if (response.success && response.data) {
        setApplication(response.data);
      } else {
        setError('Failed to fetch application details');
      }
    } catch (err: any) {
      console.error('Error fetching application details:', err);
      setError(err.response?.data?.message || 'Failed to fetch application details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id, fetchApplicationDetails]);

  const handleStatusUpdate = async () => {
    if (!application || !newStatus) return;

    try {
      setUpdating(true);
      const response = await apiService.updateApplicationStatus(application._id, newStatus);
      
      if (response.success) {
        setApplication(prev => prev ? { ...prev, status: newStatus as any } : null);
        setStatusDialogOpen(false);
        setNewStatus('');
      } else {
        setError('Failed to update application status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!application || !newNote.trim()) return;

    try {
      setUpdating(true);
      const response = await apiService.addApplicationNote(application._id, newNote);
      
      if (response.success) {
        // Refresh the application to get the updated notes
        fetchApplicationDetails();
        setNoteDialogOpen(false);
        setNewNote('');
      } else {
        setError('Failed to add note');
      }
    } catch (err: any) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'warning';
      case 'under_review': return 'info';
      case 'shortlisted': return 'primary';
      case 'interview_scheduled': return 'secondary';
      case 'interviewed': return 'secondary';
      case 'hired': return 'success';
      case 'rejected': return 'error';
      case 'withdrawn': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/applications')}
          >
            Back to Applications
          </Button>
        </Box>
      </Container>
    );
  }

  if (!application) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Application Not Found
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/applications')}
          >
            Back to Applications
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
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/applications')}
            >
              Back
            </Button>
            <Typography variant="h4">
              Application Details
            </Typography>
          </Box>
          <Chip
            label={application.status.replace('_', ' ')}
            color={getStatusColor(application.status) as any}
            size="medium"
          />
        </Box>

        <Grid container spacing={3}>
          {/* Applicant Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  Applicant Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 60, height: 60 }}>
                    {application.applicant.firstName[0]}{application.applicant.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {application.applicant.firstName} {application.applicant.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.applicant.email}
                    </Typography>
                    {application.applicant.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {application.applicant.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon fontSize="small" />
                  <Typography variant="body2">
                    Applied: {formatDate(application.createdAt)}
                  </Typography>
                </Box>
                {application.updatedAt !== application.createdAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon fontSize="small" />
                    <Typography variant="body2">
                      Last Updated: {formatDate(application.updatedAt)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Job Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon />
                  Job Information
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {application.job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {typeof application.job.company === 'string'
                    ? application.job.company
                    : application.job.company.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {application.job.location 
                    ? (typeof application.job.location === 'string' 
                        ? application.job.location 
                        : `${application.job.location.city || ''} ${application.job.location.state || ''} ${application.job.location.country || ''}`.trim())
                    : 'Location not specified'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {application.job.description}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/jobs/${application.job._id}`)}
                >
                  View Job Details
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon />
                    Cover Letter
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.coverLetter}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Resume */}
          {application.resume && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    Resume
                  </Typography>
                                     <Button
                     variant="contained"
                     startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                     disabled={loading}
                     onClick={async () => {
                       // Handle resume download
                       if (application.resume) {
                         try {
                           setLoading(true);
                           const blob = await apiService.downloadResume(application._id);
                           const url = window.URL.createObjectURL(blob);
                           const link = document.createElement('a');
                           link.href = url;
                           link.download = `resume_${application.applicant.firstName}_${application.applicant.lastName}.${application.resume.originalName.split('.').pop() || 'pdf'}`;
                           document.body.appendChild(link);
                           link.click();
                           document.body.removeChild(link);
                           window.URL.revokeObjectURL(url);
                         } catch (error: any) {
                           console.error('Error downloading resume:', error);
                           setError(error.message || 'Failed to download resume. Please try again.');
                         } finally {
                           setLoading(false);
                         }
                       } else {
                         setError('Resume file not available for download');
                       }
                     }}
                   >
                     Download Resume
                   </Button>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Actions */}
          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setStatusDialogOpen(true)}
                    >
                      Update Status
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DescriptionIcon />}
                      onClick={() => setNoteDialogOpen(true)}
                    >
                      Add Note
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Notes */}
          {application.notes && application.notes.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <List>
                    {application.notes.map((note: any, index: number) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {note.author.firstName[0]}{note.author.lastName[0]}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={note.content}
                          secondary={`${note.author.firstName} ${note.author.lastName} - ${formatDate(note.createdAt)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="shortlisted">Shortlisted</MenuItem>
                <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                <MenuItem value="interviewed">Interviewed</MenuItem>
                <MenuItem value="hired">Hired</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="withdrawn">Withdrawn</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!newStatus || updating}
              variant="contained"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add Note</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || updating}
              variant="contained"
            >
              {updating ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ApplicationDetailsPage;
