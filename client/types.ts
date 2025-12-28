export enum UserRole {
  ADMIN = 'ADMIN',
  CANDIDATE = 'CANDIDATE'
}

export enum AssessmentStatus {
  PENDING = 'PENDING',       // Assigned, not started
  IN_PROGRESS = 'IN_PROGRESS', // Currently taking
  COMPLETED = 'COMPLETED',   // Finished successfully
  TERMINATED = 'TERMINATED'  // Cheat attempt / left tab
}

export enum QuestionType {
  MCQ = 'MCQ',
  WRITTEN = 'WRITTEN'
}

export enum QuestionSection {
  REASONING = 'Reasoning',
  APTITUDE = 'Aptitude',
  TECHNICAL = 'Technical',
  GRAMMAR = 'Grammar',
  WRITTEN_INTRO = 'About Yourself',
  WRITTEN_EXP = 'Written Experience'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  section: QuestionSection;
  options?: string[]; // Only for MCQ
  correctOptionIndex?: number; // Only for MCQ, 0-based
}

export interface Assessment {
  id: string;
  name: string;
  questions: Question[];
  durationMinutes: number;
}

export interface Candidate {
  id: string; // generated User ID
  name?: string;
  designation?: string;
  email?: string;
  role: UserRole.CANDIDATE;
  password?: string;

  // Profile details
  experience?: string;
  phone?: string;
  location?: string;
  qualification?: string;
  portfolioUrl?: string;
  idProofUrl?: string;
  profileCompleted: boolean;

  // Assessment details
  assignedAssessmentId: string | null;
  assessmentStatus: AssessmentStatus;
  scorePercentage?: number;
  answers?: Record<string, any>;
  createdAt?: string;
}

export interface Admin {
  id: string;
  username?: string;
  role: UserRole.ADMIN;
}

export type User = Candidate | Admin;

// API Response types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
