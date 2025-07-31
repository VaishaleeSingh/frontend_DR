import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Work as WorkIcon, Business as BusinessIcon } from '@mui/icons-material';
import apiService from '../../services/api';

interface JobFormData {
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  category: string;
  applicationDeadline: string;
}

const initialFormData: JobFormData = {
  title: '',
  company: '',
  description: '',
  location: '',
  type: '',
  category: '',
  applicationDeadline: ''
};

const jobTypes = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' }
];

const jobCategories = [
  { value: 'technology', label: 'Technology' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'design', label: 'Design' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'operations', label: 'Operations' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'other', label: 'Other' }
];



interface CreateJobFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateJobForm: React.FC<CreateJobFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.company || !formData.description ||
          !formData.location || !formData.type || !formData.category ||
          !formData.applicationDeadline) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare data for API with default values
      const jobData = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        location: formData.location,
        type: formData.type as 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote',
        category: formData.category as 'technology' | 'marketing' | 'sales' | 'design' | 'finance' | 'hr' | 'operations' | 'customer-service' | 'other',
        applicationDeadline: formData.applicationDeadline,
        requirements: [],
        responsibilities: [],
        skills: [],
        benefits: [],
        experience: { min: 0, max: 5 },
        salary: { min: 0, max: 0, currency: 'USD' as 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD', period: 'yearly' as 'yearly' | 'monthly' | 'hourly' },
        remote: false,
        jobType: formData.type as 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote',
        experienceLevel: 'entry' as 'entry' | 'mid' | 'senior' | 'lead'
      };

      const response = await apiService.createJob(jobData);

      if (response.success) {
        setSuccess('Job created successfully!');
        setFormData(initialFormData);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      } else {
        throw new Error(response.message || 'Failed to create job');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <WorkIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1" color="primary">
          Create New Job
        </Typography>
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
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon /> Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Job Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              placeholder="e.g. Senior Software Engineer"
            />

            <TextField
              fullWidth
              label="Company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
              placeholder="e.g. Tech Corp Inc."
            />

            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
              placeholder="e.g. New York, NY or Remote"
            />

            <FormControl fullWidth required>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                label="Job Type"
              >
                {jobTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                label="Category"
              >
                {jobCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Application Deadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Job Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
            multiline
            rows={6}
            placeholder="Provide a detailed description of the job role, what the candidate will be doing, and what makes this opportunity exciting..."
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                size="large"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <WorkIcon />}
              sx={{ minWidth: 150 }}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default CreateJobForm;
