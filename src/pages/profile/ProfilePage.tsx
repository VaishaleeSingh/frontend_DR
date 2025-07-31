import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experience: number;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Form data
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    experience: user?.profile?.experience || 0,
    skills: user?.profile?.skills || [],
    education: user?.profile?.education || [],
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // New skill input
  const [newSkill, setNewSkill] = useState('');

  // Handle profile form changes
  const handleProfileChange = (field: keyof ProfileFormData, value: any) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      handleProfileChange('skills', [...profileForm.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    handleProfileChange('skills', profileForm.skills.filter(skill => skill !== skillToRemove));
  };

  // Add education
  const handleAddEducation = () => {
    handleProfileChange('education', [
      ...profileForm.education,
      { degree: '', institution: '', year: new Date().getFullYear() }
    ]);
  };

  // Update education
  const handleEducationChange = (index: number, field: string, value: any) => {
    const updatedEducation = [...profileForm.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    handleProfileChange('education', updatedEducation);
  };

  // Remove education
  const handleRemoveEducation = (index: number) => {
    handleProfileChange('education', profileForm.education.filter((_, i) => i !== index));
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.updateProfile(profileForm);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setSuccess('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      experience: user?.profile?.experience || 0,
      skills: user?.profile?.skills || [],
      education: user?.profile?.education || [],
    });
    setIsEditing(false);
    setError(null);
  };

  if (!user) {
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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h3" component="h1">
                Profile
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Manage your account information
              </Typography>
            </Box>
          </Box>
          
          {!isEditing && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Profile Information */}
          <Box>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>
                    {user.firstName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Chip 
                      label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} 
                      color="primary" 
                      size="small" 
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Personal Information */}
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileForm.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileForm.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileForm.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Box>

                {/* Experience */}
                <Typography variant="h6" gutterBottom>
                  Experience
                </Typography>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  type="number"
                  value={profileForm.experience}
                  onChange={(e) => handleProfileChange('experience', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ mb: 3 }}
                />

                {/* Skills */}
                <Typography variant="h6" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {profileForm.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={isEditing ? () => handleRemoveSkill(skill) : undefined}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <TextField
                      size="small"
                      label="Add Skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <Button variant="outlined" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </Box>
                )}

                {/* Education */}
                <Typography variant="h6" gutterBottom>
                  Education
                </Typography>
                {profileForm.education.map((edu, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        label="Degree"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        disabled={!isEditing}
                      />
                      <TextField
                        fullWidth
                        label="Institution"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        disabled={!isEditing}
                      />
                      <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveEducation(index)}
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                ))}
                {isEditing && (
                  <Button
                    variant="outlined"
                    startIcon={<SchoolIcon />}
                    onClick={handleAddEducation}
                    sx={{ mb: 3 }}
                  >
                    Add Education
                  </Button>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Account Settings */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  sx={{ mb: 2 }}
                >
                  Change Password
                </Button>

                {showPasswordForm && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          >
                            {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          >
                            {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          >
                            {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={loading}
                        size="small"
                      >
                        {loading ? <CircularProgress size={16} /> : 'Update Password'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Experience"
                      secondary={`${user.profile?.experience || 0} years`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Education"
                      secondary={`${user.profile?.education?.length || 0} entries`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfilePage;
