import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Job, 
  Application, 
  Interview, 
  ApiResponse, 
  PaginatedResponse,
  DashboardStats,
  Activity,
  FAQ,
  LoginForm,
  RegisterForm,
  JobForm,
  ApplicationForm
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'https://backend-dr-219v.onrender.com/',
      timeout: 15000, // Increased timeout
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method
        });

        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (error.response?.status === 429) {
          // Rate limiting - show user-friendly message
          console.warn('Rate limit exceeded. Please wait a moment before trying again.');
          // Don't redirect, just show the error
        } else if (error.code === 'ERR_NETWORK') {
          // Network error (CORS, etc.)
          console.error('Network error. Please check your connection and try again.');
        } else if (error.response?.status === 404) {
          // Not found - log but don't redirect
          console.warn('Resource not found:', error.config?.url);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<{ token: string; user: User }>> {
    const response: AxiosResponse<ApiResponse<{ token: string; user: User }>> = 
      await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<ApiResponse<{ token: string; user: User }>> {
    const response: AxiosResponse<ApiResponse<{ token: string; user: User }>> = 
      await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = 
      await this.api.put('/auth/profile', userData);
    return response.data;
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.put('/auth/password', passwordData);
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/auth/logout');
    return response.data;
  }

  // Job endpoints
  async getJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Job>> {
    const response: AxiosResponse<PaginatedResponse<Job>> = 
      await this.api.get('/jobs', { params });
    return response.data;
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.get(`/jobs/${id}`);
    return response.data;
  }

  async createJob(jobData: JobForm): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> =
      await this.api.post('/jobs', jobData);
    return response.data;
  }

  async getMyJobs(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Job>> {
    const response: AxiosResponse<PaginatedResponse<Job>> =
      await this.api.get('/jobs/my-jobs', { params });
    return response.data;
  }

  async updateJob(id: string, jobData: Partial<JobForm>): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.put(`/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/jobs/${id}`);
    return response.data;
  }



  // Application endpoints
  async getApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    jobId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Application>> {
    const response: AxiosResponse<PaginatedResponse<Application>> = 
      await this.api.get('/applications', { params });
    return response.data;
  }

  async getApplication(id: string): Promise<ApiResponse<Application>> {
    const response: AxiosResponse<ApiResponse<Application>> = 
      await this.api.get(`/applications/${id}`);
    return response.data;
  }

  async submitApplication(applicationData: ApplicationForm): Promise<ApiResponse<Application>> {
    console.log('📡 API Service - submitApplication called with:', applicationData);
    console.log('📡 API Service - jobId:', applicationData.jobId);

    const formData = new FormData();
    formData.append('jobId', applicationData.jobId);

    if (applicationData.coverLetter) {
      formData.append('coverLetter', applicationData.coverLetter);
    }

    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }

    if (applicationData.customAnswers) {
      formData.append('customAnswers', JSON.stringify(applicationData.customAnswers));
    }

    // Get token manually to ensure it's included
    const token = localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'multipart/form-data',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response: AxiosResponse<ApiResponse<Application>> =
      await this.api.post('/applications', formData, {
        headers,
      });
    return response.data;
  }

  async getMyApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Application>> {
    const response: AxiosResponse<PaginatedResponse<Application>> =
      await this.api.get('/applications/my-applications', { params });
    return response.data;
  }

  async getApplicationsByJob(jobId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Application>> {
    const response: AxiosResponse<PaginatedResponse<Application>> =
      await this.api.get(`/applications/job/${jobId}`, { params });
    return response.data;
  }

  async updateApplicationStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<ApiResponse<Application>> {
    const response: AxiosResponse<ApiResponse<Application>> =
      await this.api.patch(`/applications/${id}/status`, { status, reason });
    return response.data;
  }

  async addApplicationNote(
    id: string, 
    content: string, 
    isPrivate: boolean = true
  ): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post(`/applications/${id}/notes`, { content, isPrivate });
    return response.data;
  }

  async rateApplication(
    id: string, 
    rating: {
      technical?: number;
      communication?: number;
      cultural?: number;
      overall?: number;
      feedback?: string;
    }
  ): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post(`/applications/${id}/rating`, rating);
    return response.data;
  }

  async withdrawApplication(id: string, reason?: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/applications/${id}`, { data: { reason } });
    return response.data;
  }

  // Interview endpoints
  async getInterviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    upcoming?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Interview>> {
    const response: AxiosResponse<PaginatedResponse<Interview>> = 
      await this.api.get('/interviews', { params });
    return response.data;
  }

  async getInterview(id: string): Promise<ApiResponse<Interview>> {
    const response: AxiosResponse<ApiResponse<Interview>> = 
      await this.api.get(`/interviews/${id}`);
    return response.data;
  }

  async scheduleInterview(interviewData: {
    applicationId: string;
    interviewerId: string;
    type: string;
    scheduledDate: string;
    duration?: number;
    location?: string;
    meetingLink?: string;
    phoneNumber?: string;
    agenda?: string;
    round?: number;
  }): Promise<ApiResponse<Interview>> {
    const response: AxiosResponse<ApiResponse<Interview>> = 
      await this.api.post('/interviews', interviewData);
    return response.data;
  }

  async rescheduleInterview(
    id: string, 
    newDate: string, 
    reason?: string
  ): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.put(`/interviews/${id}/reschedule`, { newDate, reason });
    return response.data;
  }

  async updateInterviewStatus(
    id: string, 
    status: string, 
    reason?: string
  ): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.put(`/interviews/${id}/status`, { status, reason });
    return response.data;
  }

  async addInterviewFeedback(
    id: string, 
    feedback: any, 
    notes?: string
  ): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.put(`/interviews/${id}/feedback`, { feedback, notes });
    return response.data;
  }

  // Resume endpoints
  async parseResume(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('resume', file);

    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/resumes/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data;
  }

  async updateApplicationWithParsedData(
    applicationId: string, 
    parsedData: any
  ): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.put(`/resumes/application/${applicationId}`, { parsedData });
    return response.data;
  }

  async getParsedResumeData(applicationId: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get(`/resumes/application/${applicationId}`);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = 
      await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivity(limit?: number): Promise<ApiResponse<Activity[]>> {
    const response: AxiosResponse<ApiResponse<Activity[]>> = 
      await this.api.get('/dashboard/recent-activity', { params: { limit } });
    return response.data;
  }

  // Chatbot endpoints
  async sendChatMessage(message: string, sessionId?: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/chatbot/message', { message, sessionId });
    return response.data;
  }

  async getFAQs(): Promise<ApiResponse<FAQ[]>> {
    const response: AxiosResponse<ApiResponse<FAQ[]>> = await this.api.get('/chatbot/faqs');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/health');
    return response.data;
  }

  // Generic HTTP methods for custom endpoints
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
