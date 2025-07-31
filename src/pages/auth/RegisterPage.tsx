import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  PersonAdd,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Validation schema
const schema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .oneOf(['applicant', 'recruiter'], 'Please select a valid role')
    .required('Role is required'),
  phone: yup
    .string()
    .optional()
    .matches(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, state, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'applicant' as const,
      phone: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: any) => {
    try {
      clearError();
      await register(data);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (state.isLoading) {
    return <LoadingSpinner fullScreen message="Creating your account..." />;
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <PersonAdd sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Create Account
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join our recruitment platform and start your journey today!
          </Typography>

          {/* Error Alert */}
          {state.error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {state.error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: '100%' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Name Fields */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      autoComplete="given-name"
                      autoFocus
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      autoComplete="family-name"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                </Box>
              </Box>

              {/* Email */}
              <Box>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      type="email"
                      autoComplete="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {/* Phone */}
              <Box>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number (Optional)"
                      type="tel"
                      autoComplete="tel"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {/* Role Selection */}
              <Box>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset" error={!!errors.role}>
                      <FormLabel component="legend">I am a:</FormLabel>
                      <RadioGroup
                        {...field}
                        row
                        sx={{ mt: 1 }}
                      >
                        <FormControlLabel
                          value="applicant"
                          control={<Radio />}
                          label="Job Seeker"
                        />
                        <FormControlLabel
                          value="recruiter"
                          control={<Radio />}
                          label="Recruiter"
                        />
                      </RadioGroup>
                      {errors.role && (
                        <Typography variant="caption" color="error">
                          {errors.role.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Box>

              {/* Password Fields */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={handleToggleConfirmPasswordVisibility}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                </Box>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  color="primary"
                  fontWeight="bold"
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Role Description */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {selectedRole === 'applicant' ? (
                <span>
                  <strong>Job Seekers</strong> can browse jobs, submit applications, 
                  upload resumes, and track application status.
                </span>
              ) : (
                <span>
                  <strong>Recruiters</strong> can post jobs, manage applications, 
                  schedule interviews, and access analytics dashboard.
                </span>
              )}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
