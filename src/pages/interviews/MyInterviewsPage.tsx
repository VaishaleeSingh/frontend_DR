import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Interview } from '../../types';

interface InterviewWithDetails extends Omit<Interview, 'job' | 'applicant' | 'interviewer'> {
  job?: any;
  applicant?: any;
  interviewer?: any;
}

const MyInterviewsPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();

  // State
  const [interviews, setInterviews] = useState<InterviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch my interviews
  const fetchMyInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching interviews for user:', user);
      const response = await apiService.get('/interviews/my-interviews');
      console.log('Interview response:', response);
      
      if (response.success) {
        console.log('Interviews data:', response.data);
        setInterviews(response.data.interviews || response.data || []);
      } else {
        setError('Failed to fetch interviews: ' + response.message);
      }
    } catch (err) {
      console.error('Interview fetch error:', err);
      console.error('Error details:', {
        message: (err as any)?.message,
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status
      });
      setError('Error loading interviews: ' + (err as any)?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyInterviews();
  }, [fetchMyInterviews]);

  // Filter interviews based on tab
  const getFilteredInterviews = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 0: // Upcoming
        return interviews.filter(interview => 
          isAfter(parseISO(interview.scheduledDate), now) && 
          interview.status !== 'cancelled' && 
          interview.status !== 'completed'
        );
      case 1: // Today
        const today = new Date();
        const tomorrow = addDays(today, 1);
        return interviews.filter(interview => {
          const interviewDate = parseISO(interview.scheduledDate);
          return isAfter(interviewDate, today) && isBefore(interviewDate, tomorrow);
        });
      case 2: // Past
        return interviews.filter(interview => 
          isBefore(parseISO(interview.scheduledDate), now) || 
          interview.status === 'completed'
        );
      default:
        return interviews;
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

  // Get time until interview
  const getTimeUntilInterview = (scheduledDate: string) => {
    const now = new Date();
    const interviewDate = parseISO(scheduledDate);
    const diffInMs = interviewDate.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} away`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} away`;
    } else {
      return 'Starting soon';
    }
  };

  const filteredInterviews = getFilteredInterviews();

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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ScheduleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h3" component="h1">
                My Interviews
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Track your interview schedule
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchMyInterviews}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label={`Upcoming (${getFilteredInterviews().length})`} />
            <Tab label="Today" />
            <Tab label="Past" />
          </Tabs>
        </Paper>

        {/* Interviews List */}
        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {activeTab === 0 ? 'No upcoming interviews' : activeTab === 1 ? 'No interviews today' : 'No past interviews'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 0 
                  ? 'You don\'t have any upcoming interviews scheduled.'
                  : activeTab === 1 
                  ? 'You don\'t have any interviews scheduled for today.'
                  : 'You don\'t have any past interviews yet.'
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 3 }}>
            {filteredInterviews.map((interview) => (
              <Box key={interview._id}>
                <Card sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }} onClick={() => navigate(`/interviews/${interview._id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getTypeIcon(interview.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {interview.job?.title || 'Interview'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {typeof interview.job?.company === 'string' 
                              ? interview.job.company 
                              : interview.job?.company?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={interview.status.replace('_', ' ')}
                          color={getStatusColor(interview.status) as any}
                          size="small"
                        />
                        {activeTab === 0 && (
                          <Chip
                            label={getTimeUntilInterview(interview.scheduledDate)}
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>

                                         <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                       <Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                           <EventIcon fontSize="small" color="action" />
                           <Typography variant="body2">
                             {format(parseISO(interview.scheduledDate), 'EEEE, MMMM dd, yyyy')}
                           </Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                           <TimeIcon fontSize="small" color="action" />
                           <Typography variant="body2">
                             {format(parseISO(interview.scheduledDate), 'hh:mm a')} • {interview.duration} minutes
                           </Typography>
                         </Box>
                       </Box>
                       <Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                           {getTypeIcon(interview.type)}
                           <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                             {interview.type} Interview
                           </Typography>
                         </Box>
                         {interview.location && (
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <LocationIcon fontSize="small" color="action" />
                             <Typography variant="body2" sx={{ 
                               overflow: 'hidden',
                               textOverflow: 'ellipsis',
                               whiteSpace: 'nowrap'
                             }}>
                               {interview.location}
                             </Typography>
                           </Box>
                         )}
                       </Box>
                     </Box>

                    {interview.notes && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Note: {interview.notes}
                        </Typography>
                      </Box>
                    )}
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

export default MyInterviewsPage; 