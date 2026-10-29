import { INITIAL_SKILLS } from './initialData';
import { SkillNode, UserStats } from '../types/calculus';
export const newUserStats = (name = 'Estudante'): UserStats => ({ name, course: 'Cálculo', university: '', professor: '', level: 1, currentXp: 0, nextLevelXp: 1000, streakDays: 0, streakProtected: false, focusEnergy: 100, recentAttemptsCount: 0, accuracyRate: 0, masteredSkillsCount: 0, totalSkillsCount: INITIAL_SKILLS.length, title: 'Explorador do Cálculo' });
export const newUserSkills = (): SkillNode[] => INITIAL_SKILLS.map(s => ({ ...s, masteryScore: 0, status: 'unlearned', totalAttempts: 0, successfulAttempts: 0, evidence: [] }));
