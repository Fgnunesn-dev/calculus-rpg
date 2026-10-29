import { MathText } from './MathText';
import React, { useRef, useState } from 'react';
import { ExerciseItem } from '../types/calculus';
import { MathView } from './MathView';
import { MathKeypad } from './MathKeypad';
import { FunctionGrapher } from './FunctionGrapher';
import { privateFetch } from '../lib/api';
import { 
  CheckCircle2, AlertCircle, Sparkles, HelpCircle, 
  ChevronRight, ArrowRight, Lightbulb, Compass, Award, RefreshCw 
} from 'lucide-react';

interface LearningArenaProps {
  currentExercise: ExerciseItem;
  onSelectAnotherExercise: (exerciseId: string) => void;
  availableExercises: ExerciseItem[];
  onAwardXp: (amount: number, reason: string) => Promise<void>;
}

export const LearningArena: React.FC<LearningArenaProps> = ({
  currentExercise,
  onSelectAnotherExercise,
  availableExercises,
  onAwardXp
}) => {
  // Current step in the 10-stage adaptive flow
  // 1: Objetivo -> 2: Pré-requisitos -> 3: Resolução Interativa -> 4: Diagnóstico do Passo
  const [arenaStage, setArenaStage] = useState<'objetivo' | 'prerequisitos' | 'resolucao' | 'sucesso'>('resolucao');

  // Input states
  const [studentInputLatex, setStudentInputLatex] = useState<string>('');
  const [studentJustification, setStudentJustification] = useState<string>('');
  const [showKeypad, setShowKeypad] = useState<boolean>(true);
  const [showGraph, setShowGraph] = useState<boolean>(false);

  // Hints state (5 progressive levels)
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = no hints used

  // Diagnosis state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const verifying = useRef(false);
  const rewarded = useRef(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    isCorrect: boolean;
    classification?: string;
    explanation?: string;
    remediation?: string;
  } | null>(null);

  const handleKeypadInsert = (symbol: string) => {
    setStudentInputLatex(prev => prev + symbol);
  };

  const handleKeypadBackspace = () => {
    setStudentInputLatex(prev => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setStudentInputLatex('');
  };

  const handleRequestHint = () => {
    if (hintLevel < 5) {
      setHintLevel(prev => prev + 1);
    }
  };

  const handleVerifyStep = async () => {
    if (!studentInputLatex.trim() || verifying.current || rewarded.current) return;
    verifying.current = true;

    setIsEvaluating(true);
    setDiagnosticResult(null);

    try {
      const response = await privateFetch('/api/tutor/diagnose-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemLatex: currentExercise.enunciadoLatex,
          studentStepLatex: studentInputLatex,
          expectedAnswerLatex: currentExercise.expectedAnswerLatex,
          studentJustification,
          contextNotes: currentExercise.contextNotes
        })
      });

      if (!response.ok) throw new Error('Diagnóstico indisponível');
      const data = await response.json();
      setDiagnosticResult(data);

      if (data.isCorrect) {
        // Calculate rewarded XP based on hint dependency
        const penaltyFactor = Math.max(0.4, 1 - (hintLevel * 0.15));
        const finalXp = Math.round(currentExercise.xpReward * penaltyFactor);
        await onAwardXp(finalXp, `Resolução de ${currentExercise.questionNumber} (${hintLevel === 0 ? 'Independente!' : `${hintLevel} dicas`})`);
        rewarded.current = true;
        setArenaStage('sucesso');
      }
    } catch (err: any) {
      console.error(err);
      setDiagnosticResult({
        isCorrect: false,
        classification: 'verificacao_indisponivel',
        explanation: `${err.message || 'Não foi possível avaliar sua resolução agora.'} Sua tentativa não foi classificada como erro.`,
        remediation: 'Confira as dicas e o exemplo da trilha. A validação automática requer o serviço de IA configurado.'
      });
    } finally {
      verifying.current = false;
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Exercise Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121828] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded">
              {currentExercise.questionNumber}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-purple-300 font-medium">{currentExercise.topic}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400 font-mono">+{currentExercise.xpReward} XP</span>
          </div>
          <h1 className="text-xl font-bold text-white font-display">
            {currentExercise.title}
          </h1>
          <div className="text-xs text-slate-400 mt-1">
            Fonte: <span className="text-slate-300">{currentExercise.sourceDocument}</span> (Pág. {currentExercise.sourcePage})
          </div>
        </div>

        {/* Change exercise selector */}
        <div className="flex items-center gap-2">
          <select
            value={currentExercise.id}
            onChange={(e) => onSelectAnotherExercise(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {availableExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.questionNumber}: {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Arena Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Problem Card & Math Editor */}
        <div className="lg:col-span-8 space-y-5">
          {/* Enunciado Card */}
          <div className="bg-[#121828] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
                {currentExercise.id.startsWith('path-') ? 'Desafio complementar' : 'Enunciado do exercício'}
              </span>
              {currentExercise.contextNotes && (
                <span className="text-xs text-amber-300/90 font-mono bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  {currentExercise.contextNotes}
                </span>
              )}
            </div>

            <div className="text-slate-100 text-base leading-relaxed py-2">
              <MathView math={currentExercise.enunciadoLatex} block={true} className="text-lg text-cyan-200" />
            </div>

            {/* Toggle Graph Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-400">
                Necessita visualização geométrica de tangentes ou assíntotas?
              </span>
              <button
                type="button"
                onClick={() => setShowGraph(!showGraph)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>{showGraph ? 'Ocultar Gráfico' : 'Exibir Gráfico Interativo'}</span>
              </button>
            </div>
          </div>

          {/* Optional Interactive Graph */}
          {showGraph && (
            <FunctionGrapher />
          )}

          {/* Math Editor & Step Input */}
          <div className="bg-[#121828] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-display">
                  Sua Resolução Algébrica (LaTeX)
                </h3>
                <p className="text-xs text-slate-400">
                  Insira sua resposta final ou o passo intermediário de cálculo
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                {showKeypad ? 'Ocultar Teclado' : 'Exibir Teclado Matemático'}
              </button>
            </div>

            {/* Rendered Live Math Formula Preview */}
            <div className="min-h-[50px] bg-[#0b0f19] border border-slate-700/80 rounded-xl p-3 flex items-center justify-center">
              {studentInputLatex ? (
                <MathView math={studentInputLatex} block={true} className="text-base text-purple-200" />
              ) : (
                <span className="text-xs text-slate-500 italic">
                  A fórmula renderizada aparecerá aqui em tempo real...
                </span>
              )}
            </div>

            {/* Raw Textarea Input */}
            <div>
              <textarea
                value={studentInputLatex}
                onChange={(e) => setStudentInputLatex(e.target.value)}
                placeholder="Exemplo: -4, ou \frac{-8}{1+\sqrt{1+8/x}}, ou y = 3x - 7/2..."
                rows={2}
                className="w-full bg-[#0d1322] border border-slate-700 rounded-xl p-3 text-sm text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Optional Step Justification (Crucial for Profa. Graça) */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Justificativa matemática (inclua os passos e o método utilizado):
              </label>
              <input
                type="text"
                value={studentJustification}
                onChange={(e) => setStudentJustification(e.target.value)}
                placeholder="Ex: Multipliquei pelo conjugado para cancelar a indeterminação 0/0..."
                className="w-full bg-[#0d1322] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Virtual Math Keypad */}
            {showKeypad && (
              <MathKeypad
                onInsert={handleKeypadInsert}
                onBackspace={handleKeypadBackspace}
                onClear={handleKeypadClear}
              />
            )}

            {/* Verification Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                {hintLevel > 0 ? `Dicas utilizadas: Nível ${hintLevel}/5` : 'Tentativa 100% independente'}
              </span>

              <button
                type="button"
                onClick={handleVerifyStep}
                disabled={isEvaluating || !studentInputLatex.trim()}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all active:scale-95"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Analisando Raciocínio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Verificar Resposta</span>
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic Feedback Alert */}
            {diagnosticResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  diagnosticResult.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : diagnosticResult.classification === 'verificacao_indisponivel' ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {diagnosticResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Excelente! Resolução Correta Confirmada</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                      <span>{diagnosticResult.classification === 'verificacao_indisponivel' ? 'Correção automática indisponível' : 'Ponto de Dificuldade Identificado'}</span>
                    </>
                  )}
                </div>

                {diagnosticResult.explanation && (
                  <p className="leading-relaxed"><MathText text={diagnosticResult.explanation} /></p>
                )}

                {diagnosticResult.remediation && (
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 text-slate-300">
                    <strong className="text-purple-300 block mb-0.5">Intervenção Pedagógica:</strong>
                    <MathText text={diagnosticResult.remediation} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): 5-Tier Progressive Hints & Official Steps */}
        <div className="lg:col-span-4 space-y-5">
          {/* Hints Deck (Nível 1 a 5) */}
          <div className="bg-[#121828] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Hierarquia de Dicas (1 a 5)</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Nível {hintLevel} de 5
              </span>
            </div>

            <p className="text-xs text-slate-400">
              O sistema não entrega a resposta de imediato. Peça ajuda gradual conforme sua necessidade:
            </p>

            {/* Hint Steps Display */}
            <div className="space-y-2">
              {currentExercise.sampleHints.map((hintText, index) => {
                const stepNum = index + 1;
                const isRevealed = hintLevel >= stepNum;
                const labels = [
                  'Nível 1: Pergunta Orientadora',
                  'Nível 2: Conceito / Fórmula',
                  'Nível 3: Próxima Etapa',
                  'Nível 4: Resolução Parcial',
                  'Nível 5: Gabarito Completo'
                ];

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isRevealed
                        ? 'bg-slate-900/90 border-purple-800/50 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/40 text-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-[11px] mb-1 font-mono text-purple-300">
                      {labels[index]}
                    </div>
                    {isRevealed ? (
                      <div className="text-slate-300 leading-relaxed"><MathText text={hintText} /></div>
                    ) : (
                      <div className="italic text-slate-600">Bloqueado · Peça a próxima dica para liberar</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Request Hint CTA */}
            {hintLevel < 5 && (
              <button
                type="button"
                onClick={handleRequestHint}
                className="w-full py-2 px-3 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/50 text-amber-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Liberar Dica de Nível {hintLevel + 1}</span>
              </button>
            )}
          </div>

          {/* Official Solution Steps (after completion or Level 5) */}
          {(arenaStage === 'sucesso' || hintLevel === 5) && currentExercise.officialResolutionSteps && (
            <div className="bg-[#121828] border border-emerald-900/40 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-emerald-300 font-display flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resolução Oficial da Profa. Graça</span>
              </h3>

              <div className="space-y-2 text-xs text-slate-300">
                {currentExercise.officialResolutionSteps.map((step, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{idx + 1}.</span>
                    <div>
                      <MathText text={step} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
