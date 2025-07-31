import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Upload,
  Description,
  AutoAwesome,
  Work,
  School,
  Star,
  Language,
  Psychology,
  Refresh,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: Array<{
    skill: string;
    level: number;
    category: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  overallScore: number;
  recommendations: Array<string>;
}

const ResumeParserPage: React.FC = () => {
  const { state } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type.includes('text')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a PDF or text file');
      }
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('Starting resume analysis for file:', file.name);
      
      // Call the actual API to parse the resume
      const response = await apiService.parseResume(file);
      
      if (response.success) {
        console.log('Resume parsed successfully:', response.data);
        
        // Transform the API response to match our ParsedResume interface
        const parsedData = response.data.parsedData;
        const transformedResume: ParsedResume = {
          name: parsedData.personalInfo?.name || 'Not found',
          email: parsedData.personalInfo?.email || 'Not found',
          phone: parsedData.personalInfo?.phone || 'Not found',
          summary: parsedData.summary || 'No summary available',
          experience: parsedData.experience?.map((exp: any) => ({
            title: exp.position || 'Unknown Position',
            company: exp.company || 'Unknown Company',
            duration: exp.current ? `${new Date(exp.startDate).getFullYear()} - Present` : 
                     `${new Date(exp.startDate).getFullYear()} - ${new Date(exp.endDate).getFullYear()}`,
            description: exp.description || 'No description available',
          })) || [],
          education: parsedData.education?.map((edu: any) => ({
            degree: `${edu.degree} ${edu.field ? `in ${edu.field}` : ''}`,
            institution: edu.institution || 'Unknown Institution',
            year: edu.endDate ? new Date(edu.endDate).getFullYear().toString() : 'Unknown',
          })) || [],
          skills: parsedData.skills?.map((skill: any) => ({
            skill: skill.name,
            level: skill.level === 'advanced' ? 90 : skill.level === 'intermediate' ? 75 : 60,
            category: 'Technical',
          })) || [],
          languages: parsedData.languages?.map((lang: any) => ({
            language: lang.name,
            proficiency: lang.proficiency || 'Unknown',
          })) || [],
          overallScore: 85, // Default score, could be calculated based on skills match
          recommendations: [
            'Consider highlighting leadership experience more prominently',
            'Add specific metrics and achievements to experience descriptions',
            'Include certifications if available',
            'Consider adding a projects section to showcase technical skills',
          ],
        };

        setParsedResume(transformedResume);
      } else {
        setError(response.message || 'Failed to parse resume');
      }
    } catch (err: any) {
      console.error('Resume parsing error:', err);
      setError(err.response?.data?.message || err.message || 'Error analyzing resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSkillColor = (level: number) => {
    if (level >= 90) return 'success';
    if (level >= 75) return 'primary';
    if (level >= 60) return 'warning';
    return 'error';
  };

  const getSkillLabel = (level: number) => {
    if (level >= 90) return 'Expert';
    if (level >= 75) return 'Advanced';
    if (level >= 60) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <AutoAwesome sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1">
              AI Resume Parser
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Extract and analyze resume information with AI-powered technology
            </Typography>
          </Box>
        </Box>

        {!parsedResume ? (
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                  <Description sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Upload Resume for AI Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our AI will extract key information including skills, experience, education, and provide insights
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </Button>

                {file && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" gutterBottom>
                      Selected file: {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AutoAwesome />}
                  onClick={analyzeResume}
                  disabled={!file || isAnalyzing}
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                </Button>

                {isAnalyzing && (
                  <Box sx={{ width: '100%', maxWidth: 400 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      AI is analyzing your resume...
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  What our AI analyzes:
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work color="primary" />
                    <Typography variant="body2">Work Experience</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School color="primary" />
                    <Typography variant="body2">Education</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star color="primary" />
                    <Typography variant="body2">Skills & Expertise</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language color="primary" />
                    <Typography variant="body2">Languages</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box>
            {/* Analysis Results Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Analysis Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  AI-powered resume analysis completed
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setParsedResume(null);
                  setFile(null);
                }}
              >
                Analyze Another Resume
              </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {/* Basic Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{parsedResume.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{parsedResume.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{parsedResume.phone}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Overall Score</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={parsedResume.overallScore}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{parsedResume.overallScore}%</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Skills Analysis */}
              <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Skills Analysis
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      {parsedResume.skills.map((skill) => (
                        <Box key={skill.skill}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{skill.skill}</Typography>
                            <Chip
                              label={getSkillLabel(skill.level)}
                              size="small"
                              color={getSkillColor(skill.level) as any}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={skill.level}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Experience */}
              <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Work Experience
                    </Typography>
                    <List>
                      {parsedResume.experience.map((exp, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <Work />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {exp.title}
                                  </Typography>
                                  <Typography variant="body2" color="primary">
                                    {exp.company}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {exp.duration}
                                  </Typography>
                                </Box>
                              }
                              secondary={exp.description}
                            />
                          </ListItem>
                          {index < parsedResume.experience.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* Education & Languages */}
              <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Education & Languages
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Education
                    </Typography>
                    {parsedResume.education.map((edu, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {edu.degree}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {edu.institution}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {edu.year}
                        </Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Languages
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {parsedResume.languages.map((lang, index) => (
                        <Chip
                          key={index}
                          label={`${lang.language} (${lang.proficiency})`}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* AI Recommendations */}
            <Box sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AI Recommendations
                    </Typography>
                    <List>
                      {parsedResume.recommendations.map((rec, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                              <Psychology />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Box>
        )}
      </Box>
    </Container>
  );
};

export default ResumeParserPage; 