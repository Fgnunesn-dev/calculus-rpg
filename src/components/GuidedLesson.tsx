import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, LoaderCircle } from 'lucide-react';
import { StudyModule } from '../data/studyPath';
import { SavedLesson } from '../types/lesson';
import { privateFetch } from '../lib/api';
import { MathText } from './MathText';

export function GuidedLesson({ module, saved, signedIn, onSave, topicIndex, onTopicChange }: { module: StudyModule; saved: Record<string, SavedLesson>; signedIn: boolean; topicIndex: number; onTopicChange: (index: number) => void; onSave: (key: string, value: SavedLesson) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const key = `${module.id}:${topicIndex}`;
  const lesson = saved[key];
  const index = lesson ? Math.max(0, Math.min(lesson.step, lesson.content.steps.length - 1)) : 0;
  const step = lesson?.content.steps[index];
  const generate = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const response = await privateFetch('/api/tutor/lesson', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: module.id, lessonIndex: topicIndex }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível gerar a aula.');
      onSave(key, { content: data, step: 0 }); setReveal(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível carregar a aula.'); }
    finally { setBusy(false); }
  };
  const move = (next: number) => { if (lesson) onSave(key, { ...lesson, step: next }); setReveal(false); };
  return <section className="study-card p-5 sm:p-7 space-y-5" aria-label="Aula guiada com IA">
    <div><h3 className="text-xl font-semibold flex gap-2 items-center"><BookOpen size={20} className="text-teal-300" />Aprenda aqui, passo a passo</h3><p className="text-sm text-slate-400 mt-2">Uma explicação por vez, com exemplo resolvido e uma pergunta para conferir seu entendimento.</p></div>
    <label className="block text-sm text-slate-300">Escolha o assunto<select aria-label="Assunto da aula guiada" disabled={busy} value={topicIndex} onChange={e => { onTopicChange(Number(e.target.value)); setReveal(false); setError(null); }} className="block w-full mt-2 bg-slate-900 border border-slate-700 p-3 rounded-lg">{module.lessons.map((topic, i) => <option key={topic} value={i}>{i + 1}. {topic}</option>)}</select></label>
    {!signedIn && <p className="text-sm text-amber-200">Entre com Google para gerar a aula e salvar o passo em que parou.</p>}
    {!lesson && <button className="study-primary disabled:opacity-50" disabled={!signedIn || busy} onClick={generate}>{busy ? <><LoaderCircle size={16} className="animate-spin" />Preparando sua aula…</> : 'Gerar aula com IA'}</button>}
    {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}
    {lesson && step && <>
      <div><p className="text-xs text-teal-300">Aula gerada por IA · passo {index + 1} de {lesson.content.steps.length}</p><h4 className="font-semibold mt-2">{lesson.content.title}</h4><div role="progressbar" aria-label="Passos da aula" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={lesson.content.steps.length} className="h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden"><div className="h-full bg-teal-400" style={{ width: `${(index + 1) / lesson.content.steps.length * 100}%` }} /></div></div>
      <article key={`${key}:${index}`} className="space-y-4" aria-live="polite"><h5 className="text-lg font-semibold">{index + 1}. {step.title.replace(/^\d+[.)]\s*/, '')}</h5><div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap"><MathText text={step.explanation} /></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><h6 className="text-xs font-semibold text-teal-300 mb-2">Exemplo trabalhado</h6><div className="text-sm leading-relaxed whitespace-pre-wrap"><MathText text={step.example} /></div></div><div className="border-l-2 border-teal-700 pl-4 space-y-3"><p className="text-xs font-semibold text-slate-400">Pense antes de avançar</p><div className="text-sm"><MathText text={step.checkpoint} /></div><button className="text-sm text-teal-300 underline" aria-expanded={reveal} onClick={() => setReveal(v => !v)}>{reveal ? 'Ocultar explicação' : 'Conferir resposta explicada'}</button>{reveal && <div className="text-sm text-slate-300 whitespace-pre-wrap"><MathText text={step.answer} /></div>}</div></article>
      <div className="flex flex-wrap justify-between gap-3"><button className="study-secondary disabled:opacity-40" disabled={index === 0} onClick={() => move(index - 1)}><ArrowLeft size={15} />Passo anterior</button>{index < lesson.content.steps.length - 1 ? <button className="study-primary" onClick={() => move(index + 1)}>Próximo passo <ArrowRight size={15} /></button> : <button className="study-secondary" onClick={() => move(0)}>Rever desde o passo 1</button>}</div>
      {index === lesson.content.steps.length - 1 && <p role="status" className="text-sm text-teal-200">Você chegou ao fim da aula. Agora pratique na arena para aplicar o que estudou.</p>}
    </>}
    <p className="text-xs text-slate-500">Conteúdo autoral gerado pela IA, sujeito a revisão. Os critérios da disciplina continuam valendo. A aula e seu passo são salvos com o plano; o indicador do caderno mostra a sincronização.</p>
  </section>;
}
