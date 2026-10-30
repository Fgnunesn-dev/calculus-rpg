import { ExerciseItem } from '../types/calculus';
export type ArenaCategory = 'all' | 'exam' | 'list' | 'path' | 'personal';
export interface ArenaFilters { category: ArenaCategory; subject: string; topic: string; difficulty: string; }
export const arenaSubjects = [
  { id: 'algebra', name: 'Álgebra', topics: [['algebra', 'Fatoração e racionalização']] },
  { id: 'functions', name: 'Funções', topics: [['functions', 'Domínio e funções']] },
  { id: 'limits', name: 'Limites e continuidade', topics: [['limits', 'Definição e limites laterais'], ['infinity', 'Limites no infinito'], ['trig', 'Limites trigonométricos'], ['confronto', 'Teorema do confronto'], ['indeterminate', 'Indeterminações e racionalização'], ['continuity', 'Continuidade e funções por partes']] },
  { id: 'derivatives', name: 'Derivadas', topics: [['definition', 'Derivada pela definição'], ['rules', 'Regras de derivação e cadeia'], ['tangent', 'Reta tangente e normal'], ['implicit', 'Derivação implícita'], ['rates', 'Taxas relacionadas'], ['analysis', 'Extremos e otimização']] },
  { id: 'integrals', name: 'Integrais', topics: [['integrals', 'Integrais e Teorema Fundamental'], ['techniques', 'Técnicas de integração']] },
  { id: 'series', name: 'Sequências e séries', topics: [['series', 'Convergência e séries']] },
  { id: 'multivariable', name: 'Cálculo de várias variáveis', topics: [['multivariable', 'Derivadas parciais e gradiente']] },
  { id: 'vector', name: 'Cálculo vetorial', topics: [['vector', 'Campos e integrais de linha']] },
  { id: 'personal', name: 'Exercícios pessoais', topics: [['personal', 'Reforço das suas provas e materiais']] },
];
const knownTopics: Record<string, string> = { 'ex-prova1-q1a': 'infinity', 'ex-prova1-q1b': 'trig', 'ex-prova1-q1d': 'confronto', 'ex-prova1-q2': 'continuity', 'ex-prova1-q3': 'tangent', 'ex-prova1-q4': 'definition', 'ex-lista1-q05k': 'indeterminate', 'ex-lista1-q11d': 'trig', 'ex-lista2-q1a': 'rules', 'ex-lista2-q7a': 'implicit', 'ex-lista2-q11d': 'rates', 'ex-lista2-q16b': 'analysis' };
export const difficultyLabels: Record<string, string> = { iniciante: 'Iniciante', intermediario: 'Intermediário', desafio: 'Avançado', chefe: 'Desafio final' };
export function catalogEntry(exercise: ExerciseItem) {
  const proposed = knownTopics[exercise.id] || (exercise.id.startsWith('path-') ? exercise.id.slice(5) : 'personal');
  const subject = arenaSubjects.find(s => s.topics.some(([id]) => id === proposed)) || arenaSubjects[arenaSubjects.length - 1];
  const topic = subject.topics.find(([id]) => id === proposed) || subject.topics[0];
  const category: ArenaCategory = exercise.listNumber === 0 ? 'exam' : exercise.listNumber && exercise.listNumber > 0 ? 'list' : exercise.id.startsWith('path-') ? 'path' : 'personal';
  return { subject: subject.id, topic: topic[0], topicName: topic[1], category };
}
export function filterExercises(exercises: ExerciseItem[], filters: ArenaFilters) {
  return exercises.filter(exercise => {
    const entry = catalogEntry(exercise);
    return (filters.category === 'all' || entry.category === filters.category) && (!filters.subject || filters.subject === entry.subject) && (!filters.topic || filters.topic === entry.topic) && (!filters.difficulty || filters.difficulty === exercise.difficulty);
  });
}
