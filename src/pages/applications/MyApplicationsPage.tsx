import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  CircularProgress,
  IconButton,
  Collapse,
  Paper,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';


import { apiService } from '../../services/api';
import { Application, Interview } from '../../types';

interface ApplicationWithInterviews extends Omit<Application, 'interviews'> {
  interviews?: Interview[];
}

const MyApplicationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ApplicationWithInterviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/applications/my-applications');
      
      if (response.success) {
        // Ensure applications array exists
        const applications = response.data.applications || response.data || [];
        
        // Check if applications is an array
        if (!Array.isArray(applications)) {
          console.error('Applications is not an array:', applications);
          setApplications([]);
          return;
        }
        
        // Fetch interviews for each application
        const applicationsWithInterviews = await Promise.all(
          applications.map(async (app: Application) => {
            try {
              const interviewsResponse = await apiService.get(`/interviews?applicationId=${app._id}`);
              return {
                ...app,
                interviews: interviewsResponse.success ? interviewsResponse.data.interviews : []
              };
            } catch (err) {
              return {
                ...app,
                interviews: []
              };
            }
          })
        );
        
        setApplications(applicationsWithInterviews);
        console.log('Applications loaded:', applicationsWithInterviews.length);
      } else {
        console.error('Failed to fetch applications:', response.message);
        setError(`Failed to fetch applications: ${response.message}`);
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'under_review': return 'info';
      case 'shortlisted': return 'primary';
      case 'interview_scheduled': return 'warning';
      case 'interviewed': return 'secondary';
      case 'hired': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCallIcon />;
      case 'phone': return <PhoneIcon />;
      case 'in-person': return <LocationIcon />;
      default: return <EventIcon />;
    }
  };

  const getInterviewStatusColor = (status: string) => {
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

  const handleToggleExpand = (applicationId: string) => {
    setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Applications
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Track your job applications and interview schedules
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {applications.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No applications yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by browsing available jobs and submitting your applications
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/jobs')}
              >
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 3 }}>
            {applications.map((application) => (
              <Box key={application._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <WorkIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {application.job.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {typeof application.job.company === 'string'
                              ? application.job.company
                              : application.job.company.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={application.status.replace('_', ' ')}
                          color={getStatusColor(application.status) as any}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleToggleExpand(application._id)}
                        >
                          {expandedApplication === application._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </Typography>
                      {application.updatedAt !== application.createdAt && (
                        <Typography variant="body2" color="text.secondary">
                          Updated: {new Date(application.updatedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Interview Information */}
                    {application.interviews && application.interviews.length > 0 && (
                      <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" />
                          Interview Schedule
                        </Typography>
                        <List dense>
                          {application.interviews.map((interview) => (
                            <ListItem key={interview._id} sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                  {getInterviewTypeIcon(interview.type)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                      {format(parseISO(interview.scheduledDate), 'EEEE, MMMM dd, yyyy')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      at {format(parseISO(interview.scheduledDate), 'hh:mm a')}
                                    </Typography>
                                    <Chip
                                      label={interview.status.replace('_', ' ')}
                                      color={getInterviewStatusColor(interview.status) as any}
                                      size="small"
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                      {interview.type} Interview • {interview.duration} minutes
                                    </Typography>
                                    {interview.location && (
                                      <Typography variant="body2" color="text.secondary">
                                        {interview.location}
                                      </Typography>
                                    )}
                                    {interview.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        Note: {interview.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    )}

                    <Collapse in={expandedApplication === application._id}>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/applications/${application._id}`)}
                          startIcon={<ViewIcon />}
                        >
                          View Details
                        </Button>
                        {application.resume && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={async () => {
                              // Handle resume download
                              try {
                                const blob = await apiService.downloadResume(application._id);
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `resume_${application.applicant.firstName}_${application.applicant.lastName}.${application.resume.originalName.split('.').pop() || 'pdf'}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Error downloading resume:', error);
                                // You might want to show a snackbar or alert here
                              }
                            }}
                          >
                            Download Resume
                          </Button>
                        )}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MyApplicationsPage;
