import { useEffect, useState } from 'react';
import { ExerciseItem } from '../types/calculus';
import { arenaSubjects, ArenaFilters, catalogEntry, difficultyLabels, filterExercises } from '../lib/arenaCatalog';
import { LearningArena } from './LearningArena';

const initial: ArenaFilters = { category: 'all', subject: '', topic: '', difficulty: '' };
export function ArenaBrowser({ currentExercise, availableExercises, onSelectAnotherExercise, onAwardXp }: { currentExercise: ExerciseItem; availableExercises: ExerciseItem[]; onSelectAnotherExercise: (id: string) => void; onAwardXp: (amount: number, reason: string) => Promise<void> }) {
  const [filters, setFilters] = useState<ArenaFilters>(initial);
  const results = filterExercises(availableExercises, filters);
  const selected = results.find(ex => ex.id === currentExercise.id) || results[0];
  useEffect(() => { if (selected && selected.id !== currentExercise.id) onSelectAnotherExercise(selected.id); }, [selected?.id, currentExercise.id]);
  const selectClass = 'block mt-2 w-full min-w-0 rounded-lg bg-slate-900 border border-slate-700 p-3 text-sm text-slate-100';
  const topics = arenaSubjects.find(s => s.id === filters.subject)?.topics || arenaSubjects.flatMap(s => s.topics);
  return <>
    <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-6" aria-label="Escolher exercícios da arena"><div className="study-card p-5 space-y-4"><div><h1 className="text-xl font-semibold">Escolha seu treino</h1><p className="text-sm text-slate-400 mt-2">Filtre por origem, assunto, tópico e dificuldade. Questões de prova mantêm os critérios do enunciado.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <label className="text-sm text-slate-300">Categoria<select aria-label="Categoria de exercício" className={selectClass} value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value as ArenaFilters['category'] }))}><option value="all">Todos os exercícios</option><option value="exam">Questões de prova</option><option value="list">Listas da disciplina</option><option value="path">Treino por assunto</option><option value="personal">Meus exercícios de reforço</option></select></label>
      <label className="text-sm text-slate-300">Assunto<select aria-label="Assunto do exercício" className={selectClass} value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value, topic: '' }))}><option value="">Todos os assuntos</option>{arenaSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="text-sm text-slate-300">Tópico<select aria-label="Tópico do exercício" className={selectClass} value={filters.topic} onChange={e => setFilters(f => ({ ...f, topic: e.target.value }))}><option value="">Todos os tópicos</option>{topics.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label className="text-sm text-slate-300">Dificuldade<select aria-label="Dificuldade do exercício" className={selectClass} value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}><option value="">Todas as dificuldades</option>{Object.entries(difficultyLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </div><div className="flex flex-wrap justify-between gap-3 items-center"><p role="status" className="text-sm text-teal-300">{results.length} {results.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}</p><button className="study-secondary" onClick={() => setFilters(initial)}>Limpar filtros</button></div>
    {selected ? <label className="block text-sm text-slate-300">Exercício<select aria-label="Exercício filtrado" className={selectClass} value={selected.id} onChange={e => onSelectAnotherExercise(e.target.value)}>{results.map(ex => <option key={ex.id} value={ex.id}>{ex.questionNumber} · {catalogEntry(ex).topicName} · {difficultyLabels[ex.difficulty]} · {ex.title}</option>)}</select></label> : <p className="text-sm text-slate-400">Ainda não há exercícios nessa combinação no acervo. Escolha outro tópico, dificuldade ou categoria, ou limpe os filtros.</p>}
    </div></section>
    {selected && selected.id === currentExercise.id && <LearningArena key={selected.id} currentExercise={selected} availableExercises={results} onSelectAnotherExercise={onSelectAnotherExercise} onAwardXp={onAwardXp} />}
  </>;
}
