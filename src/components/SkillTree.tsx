import React, { useState } from 'react';
import { SkillNode, UserStats } from '../types/calculus';
import { 
  Award, Lock, CheckCircle2, AlertTriangle, ArrowRight, 
  Sparkles, Layers, ShieldCheck, Compass 
} from 'lucide-react';

interface SkillTreeProps {
  skills: SkillNode[];
  user: UserStats;
  onSelectSkillToPractice: (skillId: string) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ skills, user, onSelectSkillToPractice }) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>('algebra-fatoracao');

  const selectedSkill = skills.find(s => s.id === selectedSkillId) || skills[0];

  const categories = [
    { id: 'algebra', title: 'Fundamentos Algébricos', color: 'from-amber-500 to-orange-500' },
    { id: 'limits', title: 'O Olho do Limite & Continuidade', color: 'from-cyan-500 to-blue-500' },
    { id: 'derivatives_basics', title: 'Forja da Derivada', color: 'from-purple-500 to-indigo-500' },
    { id: 'derivatives_advanced', title: 'Técnicas Avançadas & Implícitas', color: 'from-fuchsia-500 to-pink-500' },
    { id: 'function_analysis', title: 'Domínio dos Extremos & Otimização', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* RPG Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-800/40 bg-[#0e1424] p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded">
              SISTEMA DE PROGRESSÃO RPG
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-purple-300 font-mono">Classe: {user.title}</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-display">
            Árvore de Talentos Matemáticos
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed">
            Cada habilidade requer evidência real de resolução independente para ser considerada dominada. 
            Acúmulo de XP desbloqueia patentes, mas a maestria exige consistência demonstrada em exercícios inéditos.
          </p>

          <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-400">
            <span>Nível atual: <strong className="text-purple-300">L{user.level}</strong></span>
            <span>·</span>
            <span>Habilidades Dominadas: <strong className="text-emerald-400">{user.masteredSkillsCount}/{user.totalSkillsCount}</strong></span>
          </div>
        </div>

        {/* Constellation background overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url('/src/assets/images/skill_tree_constellation_1793301020307.jpg')` }}
        />
      </div>

      {/* Main Tree + Skill Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 cols): Tree Branches */}
        <div className="lg:col-span-8 space-y-6">
          {categories.map((cat) => {
            const catSkills = skills.filter(s => s.category === cat.id);
            if (catSkills.length === 0) return null;

            return (
              <div key={cat.id} className="bg-[#121828] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cat.color}`} />
                    <span>{cat.title}</span>
                  </h2>
                  <span className="text-xs font-mono text-slate-500">
                    {catSkills.filter(s => s.status === 'mastered').length} / {catSkills.length} Dominadas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catSkills.map((skill) => {
                    const isSelected = skill.id === selectedSkillId;
                    const isMastered = skill.status === 'mastered';
                    const isUnstable = skill.status === 'unstable';

                    return (
                      <div
                        key={skill.id}
                        onClick={() => setSelectedSkillId(skill.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-100 line-clamp-1">
                            {skill.name}
                          </span>

                          {isMastered ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isUnstable ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                        </div>

                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isMastered ? 'bg-emerald-500' : isUnstable ? 'bg-rose-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${skill.masteryScore}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{skill.masteryScore}% Maestria</span>
                          <span className="uppercase text-purple-300 font-semibold">{skill.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right (4 cols): Selected Skill Dossier */}
        <div className="lg:col-span-4 bg-[#121828] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-purple-400 uppercase font-semibold">
                Dossiê de Habilidade
              </span>
              <h3 className="text-lg font-bold text-white font-display mt-0.5">
                {selectedSkill.name}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedSkill.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Taxa de Acerto:</span>
                <span className="text-purple-300 font-bold text-sm">
                  {selectedSkill.totalAttempts > 0 
                    ? Math.round((selectedSkill.successfulAttempts / selectedSkill.totalAttempts) * 100) 
                    : 0}%
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Tentativas:</span>
                <span className="text-slate-200 font-bold text-sm">
                  {selectedSkill.successfulAttempts}/{selectedSkill.totalAttempts}
                </span>
              </div>
            </div>

            {/* Prerequisites */}
            {selectedSkill.prerequisites.length > 0 && (
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Pré-Requisitos Necessários:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedSkill.prerequisites.map((p) => (
                    <span key={p} className="text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence List */}
            {selectedSkill.evidence && selectedSkill.evidence.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase block">
                  Evidências Registradas:
                </span>
                <div className="space-y-1">
                  {selectedSkill.evidence.map((ev, i) => (
                    <div key={i} className="text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 text-slate-300 flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onSelectSkillToPractice(selectedSkill.id)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Treinar Habilidade na Arena</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
