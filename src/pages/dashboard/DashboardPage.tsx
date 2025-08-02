import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work,
  Assignment,
  Event,
  TrendingUp,
  People,
  CheckCircle,
  Schedule,
  Refresh,
  ArrowForward,
  Description,
  Chat,
  Analytics,
  BusinessCenter,
  PersonSearch,
  VideoCall,
  AutoAwesome,
  Insights,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

// Type definitions for stats - matching the actual API response
interface ApplicantStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  rejectedApplications: number;
  successRate: number;
  recentApplications: any[];
  upcomingInterviews: any[];
}

interface RecruiterStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  scheduledInterviews: number;
  recentJobs: any[];
  recentApplications: any[];
}

interface AdminStats {
  totalUsers: number;
  totalApplicants: number;
  totalRecruiters: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalInterviews: number;
  recentUsers: any[];
  recentJobs: any[];
  recentApplications: any[];
}

// Union type for all possible stats
type DashboardStatsData = ApplicantStats | RecruiterStats | AdminStats;

// Reusable clickable card style
const clickableCardStyle = {
  flex: '1 1 200px',
  minWidth: { xs: 150, sm: 200 },
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  }
};

const DashboardPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async (retryCount = 0) => {
    try {
      setError(null);
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        // Type assertion to handle the API response
        setStats(response.data as unknown as DashboardStatsData);
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (err: any) {
      console.error('Dashboard stats error:', err);
      
      // Retry logic for rate limiting or network errors
      if ((err.response?.status === 429 || err.code === 'ERR_NETWORK') && retryCount < 2) {
        console.log(`Retrying dashboard stats fetch (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchDashboardStats(retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Polling: fetch stats every 5 minutes (further reduced to avoid rate limiting)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (user) {
      fetchDashboardStats();
      interval = setInterval(() => {
        fetchDashboardStats();
      }, 300000); // 5 minutes to avoid rate limiting
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const getStatsForRole = (): DashboardStatsData | null => {
    if (!stats) return null;
    return stats;
  };

  const currentStats = getStatsForRole();
  const applicantStats = user?.role === 'applicant' ? currentStats as ApplicantStats : null;
  const recruiterStats = user?.role === 'recruiter' ? currentStats as RecruiterStats : null;
  const adminStats = user?.role === 'admin' ? currentStats as AdminStats : null;

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
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
          <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  const renderApplicantDashboard = () => (
    <>
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 4 }}>
        <Card sx={clickableCardStyle} onClick={() => navigate('/jobs')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h4">{applicantStats?.totalApplications || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Applications
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/applications/my-applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Schedule />
              </Avatar>
              <Box>
                <Typography variant="h4">{applicantStats?.pendingApplications || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Applications
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/interviews')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Event />
              </Avatar>
              <Box>
                <Typography variant="h4">{applicantStats?.interviewsScheduled || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Interviews Scheduled
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/applications/my-applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h4">{applicantStats?.rejectedApplications || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected Applications
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Success Rate Card */}
      {applicantStats && applicantStats.totalApplications > 0 && (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
              Application Success Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={applicantStats.successRate}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="h6" color="primary">
                {applicantStats.successRate}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {applicantStats.totalApplications - (applicantStats.rejectedApplications || 0)} out of {applicantStats.totalApplications} applications successful
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Feature Cards */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mt: 4, 
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        Quick Actions & Features
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 4 }}>
        {/* Job Search */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/jobs')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <BusinessCenter />
              </Avatar>
              <Box>
                <Typography variant="h6">Job Search</Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse and apply for new opportunities
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Application Tracking */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/applications/my-applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <PersonSearch />
              </Avatar>
              <Box>
                <Typography variant="h6">Track Applications</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor your application status
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Interview Management */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/interviews')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <VideoCall />
              </Avatar>
              <Box>
                <Typography variant="h6">Interview Schedule</Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage your interviews
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Resume Builder */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/profile')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Description />
              </Avatar>
              <Box>
                <Typography variant="h6">Resume Builder</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and update your resume
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* AI Chatbot */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/chatbot')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <Chat />
              </Avatar>
              <Box>
                <Typography variant="h6">AI Assistant</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get help with your job search
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/analytics')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <Analytics />
              </Avatar>
              <Box>
                <Typography variant="h6">Your Analytics</Typography>
                <Typography variant="body2" color="text.secondary">
                  View your application insights
          </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
          </Box>
        </CardContent>
      </Card>
      </Box>

      {/* Upcoming Interviews Section */}
      {applicantStats?.upcomingInterviews && applicantStats.upcomingInterviews.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Upcoming Interviews
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {applicantStats.upcomingInterviews.slice(0, 3).map((interview: any) => (
              <Card key={interview._id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/interviews/${interview._id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Event />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {interview.job?.title || 'Interview'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(interview.scheduledDate).toLocaleDateString()} at {new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {interview.type} Interview • {interview.duration} minutes
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={interview.status.replace('_', ' ')}
                      color={interview.status === 'scheduled' ? 'primary' : interview.status === 'confirmed' ? 'info' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
            {applicantStats.upcomingInterviews.length > 3 && (
              <Button
                variant="outlined"
                onClick={() => navigate('/interviews')}
                sx={{ alignSelf: 'center', mt: 2 }}
              >
                View All Interviews ({applicantStats.upcomingInterviews.length})
              </Button>
            )}
          </Box>
        </>
      )}
    </>
  );

  const renderRecruiterDashboard = () => (
    <>
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 4 }}>
        <Card sx={clickableCardStyle} onClick={() => navigate('/jobs/create')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Work />
              </Avatar>
              <Box>
                <Typography variant="h4">{recruiterStats?.activeJobs || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Jobs
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h4">{recruiterStats?.totalApplications || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Applications
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/interviews')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Event />
              </Avatar>
              <Box>
                <Typography variant="h4">{recruiterStats?.scheduledInterviews || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Interviews Scheduled
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4">{recruiterStats?.pendingApplications || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Review
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Feature Cards */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mt: 4, 
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        Recruitment Management Features
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 4 }}>
        {/* Job Management */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/jobs/create')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <BusinessCenter />
              </Avatar>
              <Box>
                <Typography variant="h6">Job Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, edit, and manage job postings
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Applicant Tracking */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <PersonSearch />
              </Avatar>
              <Box>
                <Typography variant="h6">Applicant Tracking</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status updates, notes, and ratings
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Interview Scheduling */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/interviews')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <VideoCall />
              </Avatar>
              <Box>
                <Typography variant="h6">Interview Scheduling</Typography>
                <Typography variant="body2" color="text.secondary">
                  Schedule and manage interviews
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Resume Parsing */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/resume-parser')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <AutoAwesome />
              </Avatar>
              <Box>
                <Typography variant="h6">Resume Parsing</Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-powered resume analysis
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/analytics')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <Insights />
              </Avatar>
              <Box>
                <Typography variant="h6">Analytics Dashboard</Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive recruitment insights
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* AI Chatbot */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/chatbot')}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <Chat />
              </Avatar>
              <Box>
                <Typography variant="h6">AI Chatbot</Typography>
                <Typography variant="body2" color="text.secondary">
                  Intelligent recruitment assistant
          </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
          </Box>
        </CardContent>
      </Card>
      </Box>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 4 }}>
        <Card sx={clickableCardStyle} onClick={() => navigate('/profile')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h4">{adminStats?.totalUsers || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/jobs')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Work />
              </Avatar>
              <Box>
                <Typography variant="h4">{adminStats?.totalJobs || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Jobs
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h4">{adminStats?.totalApplications || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Applications
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={clickableCardStyle} onClick={() => navigate('/interviews')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4">{adminStats?.totalInterviews || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Interviews
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* System Health Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Overview
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box 
              onClick={() => navigate('/jobs')}
              sx={{ 
                cursor: 'pointer', 
                p: 2, 
                borderRadius: 1, 
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.02)',
                }
              }}
            >
              <Typography variant="body2" color="text.secondary">Active Jobs</Typography>
              <Typography variant="h6">{adminStats?.activeJobs || 0}</Typography>
            </Box>
            <Box 
              onClick={() => navigate('/applications')}
              sx={{ 
                cursor: 'pointer', 
                p: 2, 
                borderRadius: 1, 
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.02)',
                }
              }}
            >
              <Typography variant="body2" color="text.secondary">Pending Applications</Typography>
              <Typography variant="h6">{adminStats?.pendingApplications || 0}</Typography>
            </Box>
            <Box 
              onClick={() => navigate('/profile')}
              sx={{ 
                cursor: 'pointer', 
                p: 2, 
                borderRadius: 1, 
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.02)',
                }
              }}
            >
              <Typography variant="body2" color="text.secondary">Applicants</Typography>
              <Typography variant="h6">{adminStats?.totalApplicants || 0}</Typography>
            </Box>
            <Box 
              onClick={() => navigate('/profile')}
              sx={{ 
                cursor: 'pointer', 
                p: 2, 
                borderRadius: 1, 
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.02)',
                }
              }}
            >
              <Typography variant="body2" color="text.secondary">Recruiters</Typography>
              <Typography variant="h6">{adminStats?.totalRecruiters || 0}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mt: 4, 
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        System Management Features
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 4 }}>
        {/* User Management */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/users')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h6">User Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage all users and roles
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Job Management */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/jobs')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <BusinessCenter />
              </Avatar>
              <Box>
                <Typography variant="h6">Job Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  Oversee all job postings
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Application Tracking */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/applications')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <PersonSearch />
              </Avatar>
              <Box>
                <Typography variant="h6">Application Tracking</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor all applications
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Interview Management */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/interviews')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <VideoCall />
              </Avatar>
              <Box>
                <Typography variant="h6">Interview Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage all interviews
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/analytics')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <Insights />
              </Avatar>
              <Box>
                <Typography variant="h6">Analytics Dashboard</Typography>
                <Typography variant="body2" color="text.secondary">
                  System-wide analytics
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>

        {/* AI Chatbot */}
        <Card sx={clickableCardStyle} onClick={() => navigate('/chatbot')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <Chat />
              </Avatar>
              <Box>
                <Typography variant="h6">AI Chatbot</Typography>
                <Typography variant="body2" color="text.secondary">
                  Intelligent system assistant
                </Typography>
              </Box>
              <ArrowForward sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          justifyContent: 'space-between', 
          mb: 4,
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DashboardIcon sx={{ 
              fontSize: { xs: 28, sm: 32 }, 
              color: 'primary.main' 
            }} />
            <Box>
              <Typography 
                variant="h3" 
                component="h1"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' },
                  lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }
                }}
              >
                Welcome back, {user?.firstName}!
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                }}
              >
                Here's what's happening with your {user?.role === 'applicant' ? 'job search' : 'recruitment activities'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minHeight: { xs: '44px', sm: '48px' }
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        {/* Role-specific Dashboard */}
        {user?.role === 'applicant' && renderApplicantDashboard()}
        {user?.role === 'recruiter' && renderRecruiterDashboard()}
        {user?.role === 'admin' && renderAdminDashboard()}

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {user?.role === 'applicant' && applicantStats?.recentApplications && applicantStats.recentApplications.length > 0 ? (
                applicantStats.recentApplications.map((application: any, index: number) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => navigate(`/applications/${application._id}`)}
                  >
                    <Avatar sx={{ bgcolor: 'grey.100', color: 'text.secondary' }}>
                      <Assignment />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">
                        Applied to {application.job?.title || 'Unknown Position'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={application.status?.replace('_', ' ') || 'Submitted'}
                      size="small"
                      variant="outlined"
                      color={application.status === 'pending' ? 'warning' : 'default'}
                    />
                  </Paper>
                ))
              ) : user?.role === 'recruiter' && recruiterStats?.recentApplications && recruiterStats.recentApplications.length > 0 ? (
                recruiterStats.recentApplications.map((application: any, index: number) => (
                <Paper
                  key={index}
                  elevation={1}
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => navigate(`/applications/${application._id}`)}
                >
                  <Avatar sx={{ bgcolor: 'grey.100', color: 'text.secondary' }}>
                      <People />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">
                        {application.applicant?.firstName} {application.applicant?.lastName} applied to {application.job?.title}
                      </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(application.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                      label={application.status?.replace('_', ' ') || 'Submitted'}
                    size="small"
                    variant="outlined"
                      color={application.status === 'pending' ? 'warning' : 'default'}
                  />
                </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recent activity to display
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DashboardPage;
