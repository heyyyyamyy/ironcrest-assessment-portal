import { Candidate, Assessment } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

interface LoginRequest {
  username?: string;
  password: string;
  id?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: string;
    name?: string;
    email?: string;
  };
}

interface ApiResponse<T> {
  error?: string;
  [key: string]: any;
}

class ApiService {
  private token: string | null = null;
  private user: LoginResponse['user'] | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    this.user = rawUser ? JSON.parse(rawUser) : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Network error';
      throw new Error(`${msg}. Is the server running at ${API_BASE_URL}?`);
    }

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      const text = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(text || `API request failed (${response.status})`);
      }
      return text as unknown as T;
    }

    if (!response.ok) {
      throw new Error(data?.error || `API request failed (${response.status})`);
    }

    return data as T;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('token', data.token);
    }

    if (data.user) {
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return Boolean(this.token);
  }

  // Admin methods
  async getCandidates(): Promise<Candidate[]> {
    return this.request<Candidate[]>('/admin/candidates');
  }

  async createCandidate(name: string, designation: string, assessmentId: string): Promise<{id: string, password: string}> {
    return this.request<{id: string, password: string}>('/admin/candidates', {
      method: 'POST',
      body: JSON.stringify({ name, designation, assessmentId }),
    });
  }

  async getAssessments(): Promise<Assessment[]> {
    return this.request<Assessment[]>('/admin/assessments');
  }

  async createAssessment(assessment: any): Promise<Assessment> {
    return this.request<Assessment>('/admin/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment),
    });
  }

  // Candidate methods
  async getProfile(): Promise<any> {
    return this.request<any>('/candidate/me');
  }

  async updateProfile(updates: any): Promise<any> {
    return this.request<any>('/candidate/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getAssessment(): Promise<any> {
    return this.request<any>('/candidate/assessment');
  }

  async submitAssessment(answers: Record<string, any>): Promise<any> {
    return this.request<any>('/candidate/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async terminateAssessment(): Promise<any> {
    return this.request<any>('/candidate/terminate', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
