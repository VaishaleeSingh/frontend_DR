import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const CreateJobPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Job
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create job page - Coming soon!
        </Typography>
      </Box>
    </Container>
  );
};

export default CreateJobPage;
