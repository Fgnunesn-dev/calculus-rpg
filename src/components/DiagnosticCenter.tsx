import React, { useState } from 'react';
import { AUTOPSY_PROVA_1 } from '../data/initialData';
import { MathView } from './MathView';
import { 
  ShieldAlert, AlertCircle, FileText, CheckCircle2, 
  ArrowRight, ExternalLink, Sparkles, BookOpen, GitBranch 
} from 'lucide-react';

interface DiagnosticCenterProps {
  onPracticeRemedial: (problemPrompt: string, title: string) => void;
}

export const DiagnosticCenter: React.FC<DiagnosticCenterProps> = ({ onPracticeRemedial }) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('p1-q1a');

  const selectedQuestion = AUTOPSY_PROVA_1.find(q => q.id === selectedQuestionId) || AUTOPSY_PROVA_1[0];

  const totalScore = AUTOPSY_PROVA_1.reduce((acc, q) => acc + (q.scoreAwarded || 0), 0);
  const totalPossible = AUTOPSY_PROVA_1.reduce((acc, q) => acc + q.value, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Autopsy Header Banner */}
      <div className="bg-[#121828] border border-rose-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
              DIAGNÓSTICO FORENSE ACADÊMICO
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400 font-mono">1ª Prova — 25/09/2026</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Autópsia da 1ª Avaliação Oficial (IME/UFBA)
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Análise detalhada de cada questão corrigida pela Profa. Graça Luzia Dominguez. 
            Em vez de punir o erro, investigamos a causa raiz (algébrica, conceitual ou de notação) para garantir o domínio na 2ª tentativa.
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-slate-900/90 border border-rose-800/50 p-4 rounded-xl text-center shrink-0 min-w-[150px]">
          <div className="text-[11px] font-mono text-slate-400">Nota da Avaliação</div>
          <div className="text-3xl font-black text-rose-400 font-display tabular-nums">
            {totalScore.toFixed(1)} <span className="text-sm font-normal text-slate-500">/ {totalPossible.toFixed(1)}</span>
          </div>
          <div className="text-[10px] text-amber-300 font-mono mt-1">
            Oportunidade de Recuperação
          </div>
        </div>
      </div>

      {/* Prerequisite Flow Banner */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-xs">
        <GitBranch className="w-5 h-5 text-purple-400 shrink-0" />
        <div className="text-slate-300">
          <strong className="text-purple-300">Grafo de Pré-Requisitos Identificado:</strong> O erro na Q1.c e Q2 decorre de fraqueza em <em>Fatoração de Diferença de Quadrados</em> e <em>Divisão Polinomial</em>, que bloqueia o cálculo do <em>Quociente de Newton na Definição de Derivadas (Q4)</em>.
        </div>
      </div>

      {/* Main Autopsy Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Questions */}
        <div className="lg:col-span-5 space-y-2.5">
          <h2 className="text-sm font-bold text-slate-200 font-display mb-2">
            Questões da Prova Analisadas
          </h2>

          {AUTOPSY_PROVA_1.map((item) => {
            const isSelected = item.id === selectedQuestionId;
            const isZero = item.scoreAwarded === 0;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedQuestionId(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/40 ring-1 ring-purple-500'
                    : 'bg-[#121828] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {item.number}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Valor: {item.value.toFixed(1)})
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                    {item.title}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isZero
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                    }`}
                  >
                    +{item.scoreAwarded?.toFixed(1)} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 bg-[#121828] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono text-purple-400 font-semibold uppercase">
                {selectedQuestion.number} · {selectedQuestion.title}
              </span>
              <h2 className="text-base font-bold text-white font-display mt-0.5">
                Diagnóstico Pedagógico Detalhado
              </h2>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Nota atribuída: <strong className="text-rose-400 font-bold">{selectedQuestion.scoreAwarded?.toFixed(1)} / {selectedQuestion.value.toFixed(1)}</strong>
            </div>
          </div>

          {/* Enunciado */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">
              Enunciado Original da Prova:
            </div>
            <MathView math={selectedQuestion.enunciadoLatex} block={true} className="text-cyan-200 text-sm" />
          </div>

          {/* Student Attempt vs Official Gabarito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase block">
                Tentativa na Prova (Com caneta vermelha):
              </span>
              <div className="text-rose-200 font-mono text-xs pt-1">
                {selectedQuestion.studentAnswerLatex}
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                Gabarito Oficial Esperado:
              </span>
              <div className="text-emerald-200 font-mono text-xs pt-1">
                {selectedQuestion.officialGabaritoLatex}
              </div>
            </div>
          </div>

          {/* Identified Errors and Pedagogic Remediation */}
          {selectedQuestion.identifiedErrors && selectedQuestion.identifiedErrors.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Classificação da Falha & Intervenção
              </h3>

              {selectedQuestion.identifiedErrors.map((err, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 border border-rose-700/50 uppercase">
                      {err.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">Causa:</strong> {err.description}
                  </p>

                  <div className="bg-[#121a2c] border border-cyan-900/40 p-2.5 rounded-lg text-xs text-cyan-200">
                    <strong className="text-cyan-300 block mb-0.5">Como Treinar Para Superar:</strong>
                    {err.pedagogicRemediation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Remedial Training Button */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => onPracticeRemedial(selectedQuestion.enunciadoLatex, selectedQuestion.title)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Praticar Esta Questão na Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
