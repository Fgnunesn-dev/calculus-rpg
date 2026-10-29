export interface ExamAnalysis {
  title: string;
  summary: string;
  observedScore: number | null;
  maximumScore: number | null;
  weaknesses: string[];
  strengths: string[];
  restrictions: string[];
  recommendedModuleIds: string[];
  questions: { number: string; topic: string; statement: string; feedback: string; practicePrompt: string; earnedScore: number | null; maximumScore: number | null }[];
}
export interface ExamReport { id: string; originalName: string; uploadedAt: string; analysis: ExamAnalysis; }
