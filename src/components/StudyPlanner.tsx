import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, Clock3, ExternalLink, ListChecks, NotebookPen, Route, Target } from 'lucide-react';
import { STUDY_MODULES } from '../data/studyPath';
import { MathView } from './MathView';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface PlannerState {
  checked: string[];
  selected: string;
  notes: Record<string, string>;
  weeklyGoal: number;
  studied: Record<string, string[]>;
}
const initial: PlannerState = { checked: [], selected: 'algebra', notes: {}, weeklyGoal: 4, studied: {} };
const storageKey = 'calculus-rpg-study-plan-v1';
function readPlan(key: string): PlannerState {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (!value || !Array.isArray(value.checked)) return initial;
    return { checked: value.checked.filter((v: unknown) => typeof v === 'string'), selected: STUDY_MODULES.some(m => m.id === value.selected) ? value.selected : 'algebra', notes: value.notes && typeof value.notes === 'object' ? value.notes : {}, weeklyGoal: [2, 3, 4, 5, 6, 7].includes(value.weeklyGoal) ? value.weeklyGoal : 4, studied: value.studied && typeof value.studied === 'object' ? value.studied : {} };
  } catch { return initial; }
}
const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function StudyPlanner({ onPractice, initialModule, recommendedModules = [] }: { onPractice: (id: string) => void; initialModule?: string; recommendedModules?: string[] }) {
  const { currentUser } = useAuth();
  const accountKey = `${storageKey}:${currentUser?.uid || 'guest'}`;
  const [plan, setPlanState] = useState<PlannerState>(() => ({ ...readPlan(accountKey), ...(initialModule ? { selected: initialModule } : {}) }));
  const dirtyPlan = useRef(false);
  const setPlan = (update: React.SetStateAction<PlannerState>) => { dirtyPlan.current = true; setPlanState(update); };
  const [cloudReady, setCloudReady] = useState(!currentUser);
  const [cloudLoading, setCloudLoading] = useState(Boolean(currentUser));
  const pendingSave = useRef<{ uid: string; plan: PlannerState } | null>(null);
  const [cloudStatus, setCloudStatus] = useState(currentUser ? 'Carregando plano da conta…' : 'Entre com Google para sincronizar entre dispositivos.');
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    getDoc(doc(db, 'users', currentUser.uid, 'state', 'planner')).then(snapshot => {
      if (!active) return;
      const saved = snapshot.data()?.plan;
      let localSavedAt = 0;
      try { localSavedAt = JSON.parse(localStorage.getItem(accountKey) || '{}').savedAt || 0; } catch { /* keep zero */ }
      if (saved && Array.isArray(saved.checked) && saved.notes && saved.studied && Date.parse(snapshot.data()?.updatedAt || '') >= localSavedAt) setPlanState({ ...initial, ...saved, selected: initialModule || (STUDY_MODULES.some(m => m.id === saved.selected) ? saved.selected : 'algebra') });
      setCloudReady(true); setCloudLoading(false);
    }).catch(() => { if (active) { setCloudStatus('Não foi possível carregar o plano da nuvem. As alterações ficam locais até reabrir esta área com conexão.'); setCloudLoading(false); } });
    return () => { active = false; };
  }, [currentUser?.uid]);
  const [filter, setFilter] = useState('Todos');
  const [showSolution, setShowSolution] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => { if (!dirtyPlan.current) return; try { localStorage.setItem(accountKey, JSON.stringify({ ...plan, savedAt: Date.now() })); setSaveError(false); } catch { setSaveError(true); } }, [plan, accountKey]);
  useEffect(() => {
    if (!currentUser || !cloudReady) return;
    const uid = currentUser.uid; setCloudStatus('Salvando plano na sua conta…');
    pendingSave.current = { uid, plan };
    const timer = setTimeout(() => {
      if (auth.currentUser?.uid !== uid) return;
      pendingSave.current = null;
      setDoc(doc(db, 'users', uid, 'state', 'planner'), { plan, updatedAt: new Date().toISOString() }).then(() => setCloudStatus('Plano sincronizado com sua conta Google.')).catch(() => setCloudStatus('Salvo somente neste navegador. Não foi possível sincronizar com a nuvem.'));
    }, 800);
    return () => clearTimeout(timer);
  }, [plan, cloudReady, currentUser?.uid]);
  useEffect(() => () => {
    const pending = pendingSave.current;
    if (pending && auth.currentUser?.uid === pending.uid) setDoc(doc(db, 'users', pending.uid, 'state', 'planner'), { plan: pending.plan, updatedAt: new Date().toISOString() }).catch(() => {});
  }, []);
  useEffect(() => setShowSolution(false), [plan.selected]);
  const selected = STUDY_MODULES.find(m => m.id === plan.selected)!;
  const lessonKeys = STUDY_MODULES.flatMap(m => m.lessons.map((_, i) => `${m.id}-${i}`));
  const completed = lessonKeys.filter(k => plan.checked.includes(k)).length;
  const moduleDone = (id: string) => { const m = STUDY_MODULES.find(m => m.id === id)!; return m.lessons.every((_, i) => plan.checked.includes(`${id}-${i}`)); };
  const next = STUDY_MODULES.find(m => recommendedModules.includes(m.id) && !moduleDone(m.id)) || STUDY_MODULES.find(m => !moduleDone(m.id)) || STUDY_MODULES[STUDY_MODULES.length - 1];
  const today = dayKey(new Date());
  const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return { key: dayKey(d), label: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i], date: d.getDate() }; });
  const studiedDays = days.filter(d => Array.isArray(plan.studied[d.key]) && plan.studied[d.key].length > 0).length;
  const prerequisites = STUDY_MODULES.slice(0, STUDY_MODULES.indexOf(selected)).filter(m => !moduleDone(m.id));
  const toggleLesson = (key: string) => setPlan(p => ({ ...p, checked: p.checked.includes(key) ? p.checked.filter(k => k !== key) : [...p.checked, key] }));
  const logSession = () => setPlan(p => {
    const entries = Array.isArray(p.studied[today]) ? p.studied[today] : [];
    return { ...p, studied: { ...p.studied, [today]: entries.includes(selected.id) ? entries.filter(id => id !== selected.id) : [...entries, selected.id] } };
  });
  if (cloudLoading) return <div className="max-w-7xl mx-auto p-8 text-slate-400" role="status">Carregando seu plano de estudos…</div>;
  return <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><div className="eyebrow"><Route size={14} /> SEU MAPA DE ESTUDOS</div><h1 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">Do primeiro passo<br className="sm:hidden" /> ao cálculo avançado.</h1><p className="text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed">Uma ordem clara para estudar, praticar e revisar. Construa a base, avance em Cálculo A e explore os próximos níveis no seu ritmo.</p></div>
      <button className="study-primary" onClick={() => { setPlan(p => ({ ...p, selected: next.id })); setFilter('Todos'); }}>Continuar minha trilha <ArrowRight size={16} /></button>
    </div>

    <div className="grid sm:grid-cols-3 gap-4">
      <div className="study-card p-5"><div className="flex justify-between text-sm text-slate-400"><span>Etapas estudadas</span><ListChecks size={18} /></div><div className="text-3xl font-semibold mt-3">{completed}<span className="text-base text-slate-500 font-normal"> / {lessonKeys.length}</span></div><div className="h-1.5 rounded-full bg-slate-800 mt-4 overflow-hidden" role="progressbar" aria-label="Progresso na trilha" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={lessonKeys.length}><div className="h-full bg-teal-400" style={{ width: `${completed / lessonKeys.length * 100}%` }} /></div><p className="text-xs text-slate-500 mt-2">Checklist pessoal · não altera sua maestria ou XP</p></div>
      <div className="study-card p-5"><div className="flex justify-between text-sm text-slate-400"><span>{recommendedModules.includes(next.id) ? 'Prioridade pelas suas resoluções' : 'Seu próximo passo'}</span><Target size={18} /></div><div className="text-lg font-semibold mt-3">{completed === lessonKeys.length ? 'Revisar e consolidar' : next.title}</div><p className="text-xs text-slate-500 mt-2">{next.phase} · {next.duration} sugeridas de 30–45 min</p><button onClick={() => { setPlan(p => ({ ...p, selected: next.id })); setFilter('Todos'); }} className="text-teal-300 text-xs mt-4 inline-flex gap-2 items-center">Abrir etapa <ArrowRight size={14} /></button></div>
      <div className="study-card p-5"><label className="flex items-center justify-between text-sm text-slate-400">Meta semanal<select aria-label="Meta semanal em dias" className="bg-slate-800 text-slate-200 rounded-md p-1 text-xs" value={plan.weeklyGoal} onChange={e => setPlan(p => ({ ...p, weeklyGoal: Number(e.target.value) }))}>{[2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} dias</option>)}</select></label><div className="text-3xl font-semibold mt-3">{studiedDays}<span className="text-base text-slate-500 font-normal"> / {plan.weeklyGoal} dias</span></div><div className="flex gap-2 mt-3">{days.map(d => <div key={d.key} title={`${d.key}${plan.studied[d.key]?.length ? ' · estudo registrado' : ''}`} className={`flex-1 text-center text-[11px] rounded-md py-1.5 border ${plan.studied[d.key]?.length ? 'bg-teal-950 border-teal-700 text-teal-300' : 'bg-slate-900 border-slate-800 text-slate-500'} ${d.key === today ? 'ring-1 ring-slate-400' : ''}`}>{d.label}<div>{d.date}</div></div>)}</div></div>
    </div>

    <div className="grid lg:grid-cols-[310px_minmax(0,1fr)] gap-6 items-start">
      <aside className="study-card overflow-hidden">
        <div className="p-4 border-b border-slate-800"><h2 className="font-semibold">Trilha de aprendizagem</h2><div className="flex flex-wrap gap-1.5 mt-3" aria-label="Filtrar trilha">{['Todos', 'Base', 'Cálculo A', 'Continuação'].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium ${filter === f ? 'bg-teal-900 text-teal-200' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{f}</button>)}</div></div>
        <div className="p-2 space-y-1 max-h-80 lg:max-h-none overflow-y-auto">{STUDY_MODULES.map((m, i) => { if (filter !== 'Todos' && m.phase !== filter) return null; const count = m.lessons.filter((_, j) => plan.checked.includes(`${m.id}-${j}`)).length; return <button key={m.id} aria-current={selected.id === m.id ? 'step' : undefined} onClick={() => setPlan(p => ({ ...p, selected: m.id }))} className={`w-full text-left p-3 rounded-lg flex items-start gap-3 border transition-colors ${selected.id === m.id ? 'bg-[#18302f] border-teal-800' : 'border-transparent hover:bg-slate-800/60'}`}><span className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-xs font-mono ${moduleDone(m.id) ? 'bg-teal-800 text-teal-200' : 'bg-slate-800 text-slate-400'}`}>{moduleDone(m.id) ? <Check size={14} /> : String(i + 1).padStart(2, '0')}</span><span className="min-w-0"><span className={`text-xs font-semibold block leading-relaxed ${selected.id === m.id ? 'text-teal-100' : 'text-slate-300'}`}>{m.title}</span><span className="text-[10px] text-slate-500 mt-1 block">{m.phase} · {count}/{m.lessons.length} etapas{recommendedModules.includes(m.id) ? ' · Revisão indicada pela prova' : ''}</span></span><ChevronRight size={14} className="ml-auto shrink-0 mt-1 text-slate-500" /></button>; })}</div>
      </aside>

      <div className="space-y-5 min-w-0">
        <section className="study-card p-5 sm:p-7">
          <div className="flex flex-wrap gap-3 text-xs text-slate-400 items-center"><span className="text-teal-300 bg-teal-950 border border-teal-900 rounded-md px-2 py-1">{selected.phase === 'Continuação' ? 'EXPANSÃO · ALÉM DO MATERIAL ATUAL' : selected.phase === 'Base' ? 'FUNDAMENTOS' : 'FOCO NA DISCIPLINA'}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{selected.duration}</span></div>
          <h2 className="text-2xl font-bold mt-4">{selected.title}</h2><p className="text-sm text-slate-400 mt-2 leading-relaxed">{selected.description}</p>
          {prerequisites.length > 0 && <p className="text-xs leading-relaxed text-amber-200 bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg mt-4">Antes desta etapa, vale revisar: {prerequisites.slice(-2).map(m => m.title).join(' e ')}. Você pode explorar todos os módulos livremente.</p>}
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-3">O que estudar, em ordem</h3>
          <div className="space-y-2">{selected.lessons.map((lesson, i) => <label key={`${selected.id}-${i}`} className="flex items-center gap-3 rounded-lg p-3 bg-slate-900/60 cursor-pointer hover:bg-slate-800 transition-colors"><input type="checkbox" className="w-4 h-4 accent-teal-500 shrink-0" checked={plan.checked.includes(`${selected.id}-${i}`)} onChange={() => toggleLesson(`${selected.id}-${i}`)} /><span className={`text-sm ${plan.checked.includes(`${selected.id}-${i}`) ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{lesson}</span></label>)}</div>
          <div className="border-l-2 border-teal-500 bg-[#142526] p-4 mt-5 rounded-r-lg"><h3 className="text-xs font-semibold text-teal-300">Como entregar uma resolução completa</h3><p className="text-xs text-slate-300 leading-relaxed mt-2">{selected.standard}</p></div>
          <div className="mt-5 p-3 bg-[#0c131e] rounded-lg"><MathView math={selected.formula} block /></div>
          <div className="flex flex-wrap gap-3 mt-5"><button className="study-primary" onClick={() => onPractice(selected.exerciseId)}>Praticar na arena <ArrowRight size={15} /></button><button className="study-secondary" aria-pressed={Boolean(plan.studied[today]?.includes(selected.id))} onClick={logSession}><Check size={15} />{plan.studied[today]?.includes(selected.id) ? 'Estudo registrado · desfazer' : 'Registrar estudo de hoje'}</button></div>
        </section>

        <div className="grid md:grid-cols-2 gap-5">
          <section className="study-card p-5"><h3 className="font-semibold text-sm flex items-center gap-2"><BookOpen size={16} className="text-teal-300" />Exemplo guiado</h3><p className="text-sm text-slate-300 leading-relaxed mt-4">{selected.example}</p><button className="text-xs text-teal-300 underline underline-offset-4 mt-4" aria-expanded={showSolution} onClick={() => setShowSolution(v => !v)}>{showSolution ? 'Ocultar resolução' : 'Conferir raciocínio'}</button>{showSolution && <p className="text-xs text-slate-400 mt-3 leading-relaxed">{selected.solution}</p>}<p className="text-[10px] text-slate-500 mt-4">Exemplo autoral · treino de justificativa</p></section>
          <section className="study-card p-5"><h3 className="font-semibold text-sm flex items-center gap-2"><ExternalLink size={16} className="text-teal-300" />Leitura complementar</h3><a href={selected.resource.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-teal-200 hover:underline mt-4">{selected.resource.title} ↗</a><p className="text-xs text-slate-500 mt-2">{selected.resource.language}</p><a href="https://www.gma.uff.br/calculo1/index.php" target="_blank" rel="noopener noreferrer" className="block text-sm text-teal-200 hover:underline mt-4">UFF · Curso de Cálculo 1 ↗</a><p className="text-xs text-slate-500 mt-2">Português · funções, limites e derivadas</p><p className="text-xs text-slate-400 leading-relaxed mt-3">Use para aprofundar a teoria. Na avaliação, priorize os enunciados, métodos e restrições dos materiais da professora.</p><a href="https://assets.openstax.org/oscms-prodcms/media/documents/calculus-volume-1_-_WEB.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-300 underline underline-offset-4 mt-4 inline-block">Abrir livro de Cálculo I em PDF ↗</a></section>
        </div>

        <section className="study-card p-5"><label htmlFor="module-notes" className="font-semibold text-sm flex items-center gap-2"><NotebookPen size={16} className="text-teal-300" />Meu caderno desta etapa</label><p className="text-xs text-slate-500 mt-2 mb-3">Anote dúvidas, erros recorrentes e o que revisar na próxima sessão.</p><textarea id="module-notes" value={typeof plan.notes[selected.id] === 'string' ? plan.notes[selected.id] : ''} onChange={e => setPlan(p => ({ ...p, notes: { ...p.notes, [selected.id]: e.target.value } }))} placeholder="Ex.: revisar sinais ao multiplicar pelo conjugado…" rows={4} className="w-full bg-[#0c131e] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 outline-none resize-y" /><p className={`text-[11px] mt-2 ${saveError ? 'text-amber-300' : 'text-slate-500'}`} role="status">{saveError ? 'Não foi possível salvar. O armazenamento do navegador está indisponível.' : cloudStatus}</p></section>
        <p className="text-xs text-slate-500 leading-relaxed px-1">A sequência é uma proposta de estudo. O núcleo de Cálculo A acompanha os tópicos registrados no projeto; integrais, séries e cálculo multivariável são uma continuação complementar, sem indicação de cobrança na sua prova atual.</p>
      </div>
    </div>
  </div>;
}
