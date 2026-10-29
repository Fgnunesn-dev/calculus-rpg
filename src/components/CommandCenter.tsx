import React from 'react';
import { UserStats, SkillNode, ExerciseItem } from '../types/calculus';
import { 
  Compass, Flame, ShieldAlert, Award, ArrowRight, CheckCircle2, 
  RotateCcw, BookOpen, Target, Sparkles, TrendingUp, AlertTriangle, Layers
} from 'lucide-react';
import { MathView } from './MathView';

interface CommandCenterProps {
  user: UserStats;
  skills: SkillNode[];
  exercises: ExerciseItem[];
  onStartMission: (exerciseId: string) => void;
  onNavigateToArena: () => void;
  onNavigateToTutor: () => void;
  onNavigateToDiagnostic: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  user,
  skills,
  exercises,
  onStartMission,
  onNavigateToArena,
  onNavigateToTutor,
  onNavigateToDiagnostic
}) => {
  // Urgent difficulty identified in student's profile & exam
  const criticalGapSkill = skills.find(s => s.id === 'algebra-fatoracao') || skills[0];
  
  // Pending reviews
  const reviewDueSkills = skills.filter(s => s.status === 'review_due' || s.status === 'unstable');
  
  // Mastered skills
  const masteredSkills = skills.filter(s => s.status === 'mastered');

  // Overall mastery calculation
  const totalMastery = Math.round(
    skills.reduce((acc, s) => acc + s.masteryScore, 0) / skills.length
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Mission Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-900/40 bg-gradient-to-r from-[#120f24] via-[#0e1424] to-[#0a1220] p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-md">
              MISSÃO RECOMENDADA #07
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300 font-medium">Prioridade Máxima para a 2ª Tentativa</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-display">
            Desarmar Indeterminações 0/0 e Fatoração Algébrica
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Sua 1ª Prova com a Profa. Graça indicou perda de 4,0 pontos em limites com radicais conjugados e fatoração de polinômios. 
            Conclua o módulo de recuperação para desbloquear o simulador da 2ª Prova.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onStartMission('ex-prova1-q1a')}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-cyan-300" />
              <span>Iniciar Missão: Limite com Conjugado</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNavigateToDiagnostic}
              className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Ver Autópsia da 1ª Prova</span>
            </button>
          </div>
        </div>

        {/* Ambient geometric illustration glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-purple-600/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* The 5 Fundamental Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Q1: Maior dificuldade */}
        <div className="bg-[#121828] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Maior Dificuldade Atual
            </span>
            <span className="font-mono">{criticalGapSkill.masteryScore}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{criticalGapSkill.name}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {criticalGapSkill.evidence[0] || 'Dificuldade em cancelar termos nulos no denominador.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToArena}
            className="w-full text-xs py-1.5 px-3 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
          >
            <span>Resolver Exercício Guiado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Q2: O que revisar */}
        <div className="bg-[#121828] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              Revisões Pendentes
            </span>
            <span className="font-mono">{reviewDueSkills.length} tópicos</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Limites Trigonométricos</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Revisão espaçada recomendada: identidades de cosseno e seno fundamental.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToTutor}
            className="w-full text-xs py-1.5 px-3 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 text-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
          >
            <span>Pedir Dica ao Tutor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Q3: O que aprendeu recentemente */}
        <div className="bg-[#121828] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Domínio Recente
            </span>
            <span className="font-mono">78%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Limites Laterais em Gráficos</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Excelente leitura de descontinuidades de salto e limites infinitos.
            </p>
          </div>
          <div className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30">
            ✓ 12 acertos independentes
          </div>
        </div>

        {/* Q4: Avanço da disciplina */}
        <div className="bg-[#121828] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Domínio da Disciplina
            </span>
            <span className="font-mono tabular-nums font-bold">{totalMastery}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{masteredSkills.length} de {skills.length} Habilidades</h3>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                style={{ width: `${totalMastery}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Meta P2: &gt; 70%</span>
            <span className="text-cyan-300 font-medium">Em evolução</span>
          </div>
        </div>
      </div>

      {/* Skills Mastery Grid & Professor Materials Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Skills Breakdown */}
        <div className="lg:col-span-2 bg-[#121828] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-display">
                Mapa de Habilidades & Domínio Real
              </h2>
              <p className="text-xs text-slate-400">
                Calculado com base em acertos independentes, sem pontuações infladas por cliques
              </p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
              UFBA MATA02
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.slice(0, 8).map((skill) => {
              const statusColor = 
                skill.status === 'mastered' ? 'text-emerald-400 border-emerald-800/50 bg-emerald-950/20' :
                skill.status === 'unstable' ? 'text-rose-400 border-rose-800/50 bg-rose-950/20' :
                skill.status === 'learning' ? 'text-cyan-400 border-cyan-800/50 bg-cyan-950/20' :
                'text-slate-400 border-slate-800 bg-slate-900/40';

              const statusLabel = 
                skill.status === 'mastered' ? 'Dominado' :
                skill.status === 'unstable' ? 'Instável' :
                skill.status === 'learning' ? 'Em Treino' : 'Não Iniciado';

              return (
                <div key={skill.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">{skill.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        skill.masteryScore > 65 ? 'bg-emerald-500' :
                        skill.masteryScore > 35 ? 'bg-cyan-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${skill.masteryScore}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{skill.successfulAttempts}/{skill.totalAttempts} tentativas</span>
                    <span className="font-bold text-slate-300">{skill.masteryScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Teacher's Problem Lists Progress */}
        <div className="bg-[#121828] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-100 font-display">
                Materiais da Profa. Graça
              </h2>
              <p className="text-xs text-slate-400">
                Acompanhamento das listas oficiais de 2026.2
              </p>
            </div>

            <div className="space-y-3">
              {/* 1ª Lista */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">1ª Lista (Limites & Derivadas)</span>
                  <span className="font-mono text-purple-300 font-bold">14 / 29</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '48%' }} />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Gabarito oficial verificado das pág. 5 a 8
                </div>
              </div>

              {/* 2ª Lista */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">2ª Lista (Cadeia, Implícita, Otimização)</span>
                  <span className="font-mono text-cyan-300 font-bold">4 / 16</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '25%' }} />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Gabarito oficial das pág. 6 a 14
                </div>
              </div>

              {/* Apostila de Variação */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">Estudo da Variação das Funções</span>
                  <span className="font-mono text-emerald-300 font-bold">2 / 12</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '16%' }} />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Fermat, Rolle, Lagrange e Concavidade
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onNavigateToArena}
              className="w-full py-2 px-3 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ir para a Learning Arena</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
