export interface GuidedLesson {
  title: string;
  steps: { title: string; explanation: string; example: string; checkpoint: string; answer: string }[];
}
export interface SavedLesson { content: GuidedLesson; step: number; }
export interface NotesReview { notes: string; feedback: string; createdAt: string; }
