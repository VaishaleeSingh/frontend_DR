import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Work as WorkIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Job, ApplicationForm } from '../../types';
import apiService from '../../services/api';

interface JobApplicationFormProps {
  job: Job;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  job,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<ApplicationForm>({
    jobId: job._id,
    coverLetter: '',
    resume: undefined,
    customAnswers: []
  });

  // Debug the job object and formData
  console.log('🔍 DEBUG: JobApplicationForm rendered');
  console.log('🔍 DEBUG: job object:', job);
  console.log('🔍 DEBUG: job._id:', job?._id);
  console.log('🔍 DEBUG: formData.jobId:', formData.jobId);

  // Also alert to make sure we see it
  if (!job?._id) {
    console.error('❌ CRITICAL: job._id is missing!', { job, formData });
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof ApplicationForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      handleInputChange('resume', file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Debug logging
      console.log('🚀 === APPLICATION SUBMISSION DEBUG ===');
      console.log('🚀 formData:', formData);
      console.log('🚀 job:', job);
      console.log('🚀 job._id:', job?._id);
      console.log('🚀 formData.jobId:', formData.jobId);
      console.log('🚀 Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('🚀 === END DEBUG ===');

      // Critical check
      if (!formData.jobId) {
        console.error('❌ CRITICAL ERROR: formData.jobId is missing!');
        setError('Job ID is missing. Please refresh the page and try again.');
        return;
      }

      const response = await apiService.submitApplication(formData);

      if (response.success) {
        setSuccess('Application submitted successfully!');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setError(response.message || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Application submission error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <WorkIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" component="h1" color="primary">
            Apply for Position
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {job.title} at {typeof job.company === 'string' ? job.company : job.company.name}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Cover Letter */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Cover Letter
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Tell us why you're interested in this position"
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              placeholder="Write a compelling cover letter that highlights your relevant experience and why you're a great fit for this role..."
              helperText={`${formData.coverLetter?.length || 0}/2000 characters`}
              inputProps={{ maxLength: 2000 }}
            />
          </Box>

          {/* Resume Upload */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Resume
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth>
              <InputLabel htmlFor="resume-upload">Upload Resume</InputLabel>
              <OutlinedInput
                id="resume-upload"
                type="file"
                inputProps={{
                  accept: '.pdf,.doc,.docx',
                  onChange: handleFileChange
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton component="label" htmlFor="resume-upload">
                      <AttachFileIcon />
                    </IconButton>
                  </InputAdornment>
                }
                label="Upload Resume"
              />
              {formData.resume && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Selected: {formData.resume.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleInputChange('resume', undefined)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ minWidth: 140 }}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default JobApplicationForm;
