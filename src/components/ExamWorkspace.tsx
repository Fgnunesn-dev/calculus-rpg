import { MathText } from './MathText';
import React, { useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileUp, LogIn, ShieldCheck, Target, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { privateFetch, openPrivateFile } from '../lib/api';
import { ExamReport } from '../types/exam';
import { STUDY_MODULES } from '../data/studyPath';

interface Props {
  view: 'dashboard' | 'exams'; reports: ExamReport[]; loading: boolean; error: string | null;
  onReport: (report: ExamReport) => void; onNavigate: (view: string) => void;
  onPractice: (prompt: string, title: string) => void;
}
export function ExamWorkspace({ view, reports, loading, error, onReport, onNavigate, onPractice }: Props) {
  const { currentUser, userStats, skills, loginWithGoogle } = useAuth();
  const [selectedId, setSelectedId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const report = reports.find(r => r.id === selectedId) || reports[0];
  const analysis = report?.analysis;
  const upload = async () => {
    if (!file || busy) return;
    setBusy(true); setUploadError(null);
    try {
      const form = new FormData(); form.append('file', file);
      const response = await privateFetch('/api/exams', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha na análise da prova.');
      onReport(result); setSelectedId(result.id); setFile(null); if (input.current) input.current.value = '';
    } catch (err: any) { setUploadError(err.message); }
    finally { setBusy(false); }
  };
  return <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
    <div><div className="eyebrow"><Target size={14} />{view === 'dashboard' ? 'SEU ESPAÇO DE APRENDIZAGEM' : 'DIAGNÓSTICO PESSOAL'}</div><h1 className="text-3xl font-bold mt-3">{view === 'dashboard' ? 'Seu próximo passo começa aqui.' : 'Minhas provas'}</h1><p className="text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">{view === 'dashboard' ? 'Progresso, prioridades e revisões a partir da sua própria trajetória.' : 'Envie uma prova respondida ou corrigida. A IA organiza as questões e sugere uma rota de recuperação baseada no que conseguir ler.'}</p></div>
    {!currentUser && <section className="study-card p-6 space-y-4"><h2 className="font-semibold">Entre para criar seu espaço pessoal</h2><p className="text-sm text-slate-400">Cada login Google tem seu próprio progresso e suas próprias provas. Você pode explorar a trilha sem entrar.</p><button className="study-primary" onClick={loginWithGoogle}><LogIn size={16} />Entrar com Google</button><p className="text-xs text-slate-500">Se a janela não abrir no navegador interno, use o Chrome ou Edge.</p></section>}
    <div className="grid sm:grid-cols-3 gap-4"><div className="study-card p-5"><p className="text-xs text-slate-400">Progresso da conta</p><p className="text-2xl font-semibold mt-2">Nível {userStats.level}<span className="text-sm text-slate-500 ml-3">{userStats.currentXp} XP</span></p></div><div className="study-card p-5"><p className="text-xs text-slate-400">Habilidades praticadas</p><p className="text-2xl font-semibold mt-2">{skills.filter(s => s.totalAttempts > 0).length}<span className="text-sm text-slate-500 ml-3">de {skills.length}</span></p></div><div className="study-card p-5"><p className="text-xs text-slate-400">Provas analisadas</p><p className="text-2xl font-semibold mt-2">{reports.length}</p></div></div>
    <div className="flex flex-wrap gap-3"><button className="study-secondary" onClick={() => onNavigate('planner')}><BookOpen size={16} />Abrir trilha de estudos</button>{view === 'dashboard' && <button className="study-primary" onClick={() => onNavigate('diagnostic')}><FileUp size={16} />Enviar minha prova</button>}</div>
    {(error || uploadError) && <p role="alert" className="p-4 rounded-xl border border-amber-800 text-amber-200 text-sm bg-amber-950/30">{uploadError || error}</p>}
    {view === 'exams' && currentUser && <section className="study-card p-6 space-y-4"><h2 className="font-semibold flex items-center gap-2"><FileUp size={18} className="text-teal-300" />Nova análise de prova</h2><p className="text-sm text-slate-400 leading-relaxed">Envie o PDF completo ou uma foto legível (JPG/PNG), até 25 MB. Inclua suas respostas e as correções, se houver. O arquivo será enviado ao Gemini para análise. O diagnóstico será salvo na sua conta no Firestore; o PDF ou a foto original ficam temporários neste servidor.</p><input ref={input} aria-label="Arquivo da prova" type="file" accept="application/pdf,image/jpeg,image/png" disabled={busy} className="text-sm text-slate-300 w-full file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-slate-200" onChange={e => { const f = e.target.files?.[0]; setUploadError(null); if (f && f.size > 25 * 1024 * 1024) { setUploadError('O limite por arquivo é 25 MB.'); setFile(null); return; } setFile(f || null); }} /><button className="study-primary disabled:opacity-50" disabled={!file || busy} onClick={upload}>{busy ? <><LoaderCircle size={16} className="animate-spin" />Lendo e analisando…</> : <><FileUp size={16} />Analisar e montar meu painel</>}</button><p className="text-xs text-slate-500">A análise pode levar alguns minutos. Confira o resultado com sua prova; ela não substitui a correção da professora.</p></section>}
    {loading && <p role="status" className="text-sm text-slate-400 flex gap-2 items-center"><LoaderCircle className="animate-spin" size={16} />Carregando suas provas…</p>}
    {!analysis && !loading && <section className="study-card p-6"><h2 className="font-semibold">Um painel que acompanha você</h2><p className="text-sm text-slate-400 mt-3 leading-relaxed">Ainda não há uma prova analisada nesta conta. Comece pela trilha ou envie sua avaliação para identificar os tópicos que merecem atenção. As notas e os erros de outras pessoas não aparecem aqui.</p></section>}
    {analysis && <>
      <section className="study-card p-6"><div className="flex flex-wrap gap-3 justify-between items-center"><h2 className="text-xl font-semibold">{analysis.title}</h2><select aria-label="Selecionar prova analisada" value={report.id} onChange={e => setSelectedId(e.target.value)} className="max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs">{reports.map(r => <option value={r.id} key={r.id}>{r.originalName} · {new Date(r.uploadedAt).toLocaleDateString('pt-BR')}</option>)}</select></div><p className="text-sm text-slate-300 leading-relaxed mt-4 whitespace-pre-wrap"><MathText text={analysis.summary} /></p><div className="flex flex-wrap gap-5 mt-4 text-xs text-slate-400"><span>Nota visível na prova: <strong className="text-slate-200">{analysis.observedScore === null ? 'não identificada' : analysis.observedScore}{analysis.maximumScore !== null ? ` / ${analysis.maximumScore}` : ''}</strong></span>{report.originalAvailable !== false ? <button className="text-teal-300 underline" onClick={() => openPrivateFile(`/api/documents/${report.id}/file`).catch(err => setUploadError(err.message))}>Abrir arquivo enviado</button> : <span>Diagnóstico preservado. O arquivo original temporário não está mais disponível.</span>}</div></section>
      <div className="grid md:grid-cols-2 gap-5">{[{ title: 'Prioridades de estudo', items: analysis.weaknesses }, { title: 'Pontos de apoio', items: analysis.strengths }].map(group => <section key={group.title} className="study-card p-5"><h3 className="font-semibold text-sm">{group.title}</h3>{group.items.length ? <ul className="space-y-3 mt-4 text-sm text-slate-400 list-disc pl-4">{group.items.map((s, i) => <li key={i}><MathText text={s} /></li>)}</ul> : <p className="text-xs text-slate-500 mt-3">Evidência insuficiente no arquivo enviado.</p>}</section>)}</div>
      {analysis.restrictions.length > 0 && <section className="study-card p-5"><h3 className="font-semibold text-sm flex items-center gap-2"><ShieldCheck size={16} className="text-teal-300" />Critérios observados na prova</h3><ul className="mt-3 space-y-2 text-sm text-slate-400 list-disc pl-4">{analysis.restrictions.map((s, i) => <li key={i}><MathText text={s} /></li>)}</ul></section>}
      <section className="study-card p-5"><h3 className="font-semibold text-sm">Rota recomendada</h3><div className="flex flex-wrap gap-2 mt-4">{analysis.recommendedModuleIds.map(id => <button className="study-secondary" key={id} onClick={() => { onNavigate(`planner:${id}`); }}>{STUDY_MODULES.find(m => m.id === id)?.title}<ArrowRight size={14} /></button>)}</div></section>
      <section className="space-y-3"><h2 className="font-semibold">Questão por questão</h2>{analysis.questions.map((q, i) => <article key={i} className="study-card p-5 space-y-3"><div className="flex justify-between gap-3"><h3 className="text-sm font-semibold">Questão {q.number} · {q.topic}</h3><span className="text-xs text-slate-500">{q.earnedScore === null ? 'Sem nota legível' : `${q.earnedScore}${q.maximumScore !== null ? ` / ${q.maximumScore}` : ''}`}</span></div><p className="text-sm text-slate-300 whitespace-pre-wrap break-words"><MathText text={q.statement} /></p><p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap"><MathText text={q.feedback} /></p><button className="text-xs text-teal-300 flex items-center gap-2" onClick={() => onPractice(`${q.practicePrompt}\n\nRestrições observadas na prova: ${analysis.restrictions.join('; ') || 'nenhuma restrição legível; justifique seu método.'}`, `Reforço · ${q.topic}`)}>Praticar exercício de reforço <ArrowRight size={14} /></button></article>)}</section>
    </>}
  </div>;
}
