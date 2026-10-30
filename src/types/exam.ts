export type AssessmentStatus = 'demonstrated' | 'partial' | 'needs_review' | 'not_assessed';
export interface ExamAssessment {
  moduleId: string;
  skillIds: string[];
  status: AssessmentStatus;
  evidence: string;
  studentWork: string;
  questionNumbers: string[];
}
export interface ExamAnalysis {
  title: string;
  summary: string;
  observedScore: number | null;
  maximumScore: number | null;
  weaknesses: string[];
  strengths: string[];
  restrictions: string[];
  recommendedModuleIds: string[];
  assessments?: ExamAssessment[];
  questions: { number: string; topic: string; statement: string; feedback: string; practicePrompt: string; earnedScore: number | null; maximumScore: number | null }[];
}
export interface ExamReport { id: string; originalName: string; uploadedAt: string; analysis: ExamAnalysis; originalAvailable?: boolean; }
