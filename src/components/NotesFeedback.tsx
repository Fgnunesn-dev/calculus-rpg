import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { privateFetch } from '../lib/api';
import { NotesReview } from '../types/lesson';
import { MathText } from './MathText';

export function NotesFeedback({ moduleId, notes, review, signedIn, onReview }: { moduleId: string; notes: string; review?: NotesReview; signedIn: boolean; onReview: (review: NotesReview) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyze = async () => {
    if (busy) return;
    const sent = notes;
    setBusy(true); setError(null);
    try {
      const response = await privateFetch('/api/tutor/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId, notes: sent }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível analisar.');
      onReview({ ...data, notes: sent });
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível analisar.'); }
    finally { setBusy(false); }
  };
  return <div className="mt-4 space-y-3">
    <button className="study-primary disabled:opacity-50" disabled={!signedIn || !notes.trim() || notes.length > 6000 || busy} onClick={analyze}>{busy ? <><LoaderCircle size={16} className="animate-spin" />Analisando suas anotações…</> : 'Analisar minhas anotações'}</button>
    <p className="text-xs text-slate-500">{signedIn ? 'Ao clicar, suas anotações deste módulo serão enviadas à IA para receber comentários. A resposta será salva com seu plano.' : 'Entre com Google para analisar e salvar suas anotações.'}{notes.length > 6000 ? ' Reduza o texto para até 6000 caracteres por análise.' : ''}</p>
    {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}
    {review && <section className="bg-slate-900 border border-teal-900 rounded-xl p-4 space-y-3" aria-label="Comentários da IA sobre suas anotações"><h4 className="text-sm font-semibold text-teal-300">Comentários sobre suas anotações</h4>{review.notes !== notes && <p className="text-xs text-amber-200">Você alterou as anotações. Esta análise se refere à versão anterior; clique no botão para atualizar.</p>}<div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap"><MathText text={review.feedback} /></div><p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleString('pt-BR')} · comentário gerado por IA</p></section>}
  </div>;
}
