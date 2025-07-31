// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'applicant' | 'recruiter' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  profile?: {
    bio?: string;
    skills?: string[];
    experience?: number;
    education?: Education[];
    linkedIn?: string;
    portfolio?: string;
    resumeUrl?: string;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  gpa?: number;
}

// Job types
export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
    description?: string;
  };
  location: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  };
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: Skill[];
  benefits?: string[];
  applicationDeadline: string;
  postedBy: string;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'filled';
  applicationsCount: number;
  viewsCount: number;
  featured: boolean;
  tags?: string[];
  applicationInstructions?: string;
  createdAt: string;
  updatedAt: string;
  hasApplied?: boolean;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
}

// Application types
export interface Application {
  _id: string;
  applicant: User;
  job: Job;
  status: ApplicationStatus;
  coverLetter?: string;
  resume?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedAt: string;
  };
  parsedResumeData?: ParsedResumeData;
  aiScreeningScore?: {
    overall: number;
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    analysis: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    lastUpdated: string;
  };
  customAnswers?: CustomAnswer[];
  notes?: Note[];
  timeline?: TimelineEntry[];
  interviews?: string[];
  rating?: Rating;
  withdrawalReason?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interviewed'
  | 'second_interview'
  | 'final_interview'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_declined'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface CustomAnswer {
  question: string;
  answer: string;
  required: boolean;
}

export interface Note {
  author: User;
  content: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface TimelineEntry {
  status: string;
  changedBy: User;
  reason?: string;
  timestamp: string;
}

export interface Rating {
  technical?: number;
  communication?: number;
  cultural?: number;
  overall?: number;
  feedback?: string;
  ratedBy: string;
  ratedAt: string;
}

// Interview types
export interface Interview {
  _id: string;
  application: string;
  job: Job;
  applicant: User;
  interviewer: User;
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'hr' | 'final';
  round: number;
  scheduledDate: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  phoneNumber?: string;
  status: InterviewStatus;
  agenda?: string;
  notes?: string;
  feedback?: InterviewFeedback;
  questions?: InterviewQuestion[];
  attachments?: FileAttachment[];
  reminders?: Reminder[];
  reschedulingHistory?: RescheduleEntry[];
  actualStartTime?: string;
  actualEndTime?: string;
  cancellationReason?: string;
  noShowReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type InterviewStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'rescheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface InterviewFeedback {
  technical?: {
    score: number;
    comments: string;
  };
  communication?: {
    score: number;
    comments: string;
  };
  problemSolving?: {
    score: number;
    comments: string;
  };
  cultural?: {
    score: number;
    comments: string;
  };
  overall?: {
    score: number;
    recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
    comments: string;
  };
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  rating: number;
  notes: string;
}

export interface FileAttachment {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface Reminder {
  type: 'email' | 'sms' | 'notification';
  sentAt: string;
  recipient: 'applicant' | 'interviewer' | 'both';
}

export interface RescheduleEntry {
  previousDate: string;
  newDate: string;
  reason: string;
  requestedBy: string;
  timestamp: string;
}

// Parsed Resume Data types
export interface ParsedResumeData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary?: string;
  skills: ParsedSkill[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  certifications: ParsedCertification[];
  languages: ParsedLanguage[];
  projects: ParsedProject[];
}

export interface ParsedSkill {
  name: string;
  level?: string;
  yearsOfExperience?: number;
}

export interface ParsedExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
  achievements?: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  honors?: string;
}

export interface ParsedCertification {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface ParsedLanguage {
  name: string;
  proficiency: string;
}

export interface ParsedProject {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalJobs?: number;
    totalApplications?: number;
    totalInterviews?: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Dashboard types
export interface DashboardStats {
  overview: {
    totalJobs?: number;
    activeJobs?: number;
    totalApplications?: number;
    totalInterviews?: number;
    totalUsers?: number;
    totalRecruiters?: number;
    totalApplicants?: number;
    upcomingInterviews?: number;
    pendingApplications?: number;
  };
  breakdown: {
    applicationsByStatus: Record<string, number>;
    interviewsByStatus?: Record<string, number>;
  };
  recentActivity?: {
    recentJobs?: number;
    recentApplications?: number;
    recentInterviews?: number;
  };
  topJobs?: Array<{
    _id: string;
    title: string;
    applicationCount: number;
    status: string;
    createdAt: string;
  }>;
  recentApplications?: Application[];
}

export interface Activity {
  type: string;
  timestamp: string;
  data: any;
}

// Chatbot types
export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  intent: string;
  suggestions: string[];
  timestamp: string;
  isUser: boolean;
}

export interface FAQ {
  category: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'applicant' | 'recruiter';
  phone?: string;
}

export interface JobForm {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  category: 'technology' | 'marketing' | 'sales' | 'design' | 'finance' | 'hr' | 'operations' | 'customer-service' | 'other';
  experience: {
    min: number;
    max: number;
  };
  salary: {
    min: number;
    max: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';
    period: 'hourly' | 'monthly' | 'yearly';
  };
  benefits: string[];
  applicationDeadline: string;
  remote?: boolean;
}

export interface ApplicationForm {
  jobId: string;
  coverLetter?: string;
  resume?: File;
  customAnswers?: CustomAnswer[];
}
