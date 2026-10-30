export type SkillStatus = 'unlearned' | 'learning' | 'unstable' | 'mastered' | 'review_due';

export interface SkillNode {
  id: string;
  name: string;
  category: 'algebra' | 'limits' | 'derivatives_basics' | 'derivatives_advanced' | 'function_analysis';
  description: string;
  prerequisites: string[]; // skill IDs
  masteryScore: number; // 0 to 100
  status: SkillStatus;
  lastPracticed?: string;
  nextReviewDate?: string;
  totalAttempts: number;
  successfulAttempts: number;
  evidence: string[];
  examDiagnostic?: { status: 'demonstrated' | 'partial' | 'needs_review'; evidence: string; source: string };
}

export type ErrorClassification = 
  | 'erro_conceitual'
  | 'erro_algebrico'
  | 'erro_sinal'
  | 'erro_aritmetico'
  | 'formula_incorreta'
  | 'metodo_inadequado'
  | 'interpretacao_equivocada'
  | 'falha_notacao'
  | 'falta_justificativa'
  | 'acerto_sem_dominio';

export interface ExerciseItem {
  id: string;
  listNumber?: number; // 1 = 1ª Lista, 2 = 2ª Lista, 0 = 1ª Prova
  questionNumber: string; // e.g. "05.e", "01.a", "Questão 1.a"
  title: string;
  topic: string;
  subtopic: string;
  difficulty: 'iniciante' | 'intermediario' | 'desafio' | 'chefe';
  xpReward: number;
  associatedSkills: string[];
  enunciadoLatex: string;
  contextNotes?: string; // e.g. "Profa. Graça exige sem L'Hôpital na 1ª prova"
  sourceDocument: string;
  sourcePage: number;
  expectedAnswerLatex: string;
  officialResolutionSteps?: string[];
  hasOfficialAnswer: boolean;
  userStatus?: 'nao_tentado' | 'resolvido' | 'em_revisao' | 'erro_recorrente';
  sampleHints: [string, string, string, string, string]; // 5 levels
}

export interface ExamQuestion {
  id: string;
  number: string;
  value: number; // points e.g. 1.0, 2.0
  title: string;
  enunciadoLatex: string;
  officialGabaritoLatex: string;
  studentAnswerLatex?: string;
  scoreAwarded?: number;
  identifiedErrors?: {
    type: ErrorClassification;
    description: string;
    pedagogicRemediation: string;
  }[];
}

export interface DocumentItem {
  id: string;
  title: string;
  code: string;
  type: 'lista' | 'prova' | 'notas_de_aula' | 'resumo';
  semester: string;
  professor: string;
  totalPages: number;
  url: string;
  extractedQuestionsCount: number;
  topicsCovered: string[];
  summary: string;
}

export interface UserStats {
  name: string;
  course: string;
  university: string;
  professor: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  streakProtected: boolean;
  focusEnergy: number; // 0 to 100
  recentAttemptsCount: number;
  accuracyRate: number; // percentage
  masteredSkillsCount: number;
  totalSkillsCount: number;
  title: string;
}

export interface TutorChatMessage {
  id: string;
  sender: 'user' | 'tutor' | 'system';
  mode?: 'aprender' | 'praticar' | 'investigar_erro' | 'revisar' | 'desafio' | 'modo_prova';
  content: string;
  latex?: string;
  hintLevel?: number; // 1 to 5
  timestamp: string;
  suggestedPrompts?: string[];
}
