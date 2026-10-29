import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopBar } from './components/TopBar';
import { CommandCenter } from './components/CommandCenter';
import { LearningArena } from './components/LearningArena';
import { AiTutor } from './components/AiTutor';
import { DocumentLibrary } from './components/DocumentLibrary';
import { DiagnosticCenter } from './components/DiagnosticCenter';
import { SkillTree } from './components/SkillTree';
import { INITIAL_EXERCISES } from './data/initialData';
import { ExerciseItem } from './types/calculus';
import { Trophy } from 'lucide-react';

function CalculusRpgApp() {
  const { userStats, skills, awardXp, updateSkillMastery } = useAuth();
  const [currentView, setCurrentView] = useState<string>('command');
  const [exercises, setExercises] = useState<ExerciseItem[]>(INITIAL_EXERCISES);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex-prova1-q1a');
  
  // Notification toast
  const [toast, setToast] = useState<{ message: string; xp?: number } | null>(null);

  const showToast = (message: string, xp?: number) => {
    setToast({ message, xp });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleAwardXp = async (amount: number, reason: string) => {
    await awardXp(amount, reason);
    showToast(`+${amount} XP: ${reason}`, amount);
  };

  const handleStartMission = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setCurrentView('arena');
  };

  const handlePracticeFromDocument = (prompt: string, title: string) => {
    const found = exercises.find(e => e.enunciadoLatex.includes(prompt) || prompt.includes(e.enunciadoLatex));
    if (found) {
      setSelectedExerciseId(found.id);
    } else {
      const customEx: ExerciseItem = {
        id: `custom-${Date.now()}`,
        questionNumber: 'Extração S3',
        title: title || 'Exercício Extraído por OCR',
        topic: 'Cálculo A',
        subtopic: 'Documento Pessoal',
        difficulty: 'intermediario',
        xpReward: 50,
        associatedSkills: ['limites-indeterminados'],
        enunciadoLatex: prompt,
        sourceDocument: 'Upload Recente do Estudante',
        sourcePage: 1,
        expectedAnswerLatex: 'Verificar algebricamente',
        hasOfficialAnswer: false,
        sampleHints: [
          'Analise primeiro o tipo de operação matemática solicitada.',
          'Identifique se há indeterminações como [0/0] ou [inf/inf].',
          'Aplique a regra ou teorema correspondente.',
          'Desenvolva os cálculos algébricos passo a passo.',
          'Consulte o Tutor IA para conferir a demonstração formal.'
        ]
      };
      setExercises(prev => [customEx, ...prev]);
      setSelectedExerciseId(customEx.id);
    }
    setCurrentView('arena');
  };

  const currentExercise = exercises.find(e => e.id === selectedExerciseId) || exercises[0];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopBar
        user={userStats}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {currentView === 'command' && (
          <CommandCenter
            user={userStats}
            skills={skills}
            exercises={exercises}
            onStartMission={handleStartMission}
            onNavigateToArena={() => setCurrentView('arena')}
            onNavigateToTutor={() => setCurrentView('tutor')}
            onNavigateToDiagnostic={() => setCurrentView('diagnostic')}
          />
        )}

        {currentView === 'arena' && (
          <LearningArena
            currentExercise={currentExercise}
            onSelectAnotherExercise={(id) => setSelectedExerciseId(id)}
            availableExercises={exercises}
            onAwardXp={(xp, reason) => {
              handleAwardXp(xp, reason);
              if (currentExercise.associatedSkills[0]) {
                updateSkillMastery(currentExercise.associatedSkills[0], true);
              }
            }}
          />
        )}

        {currentView === 'tutor' && (
          <AiTutor />
        )}

        {currentView === 'library' && (
          <DocumentLibrary
            onSelectExerciseToPractice={handlePracticeFromDocument}
          />
        )}

        {currentView === 'diagnostic' && (
          <DiagnosticCenter
            onPracticeRemedial={handlePracticeFromDocument}
          />
        )}

        {currentView === 'skills' && (
          <SkillTree
            skills={skills}
            user={userStats}
            onSelectSkillToPractice={() => setCurrentView('arena')}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161f36] border border-purple-600/70 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="w-8 h-8 rounded-xl bg-purple-900/80 border border-purple-500/50 flex items-center justify-center text-purple-200 shrink-0">
            <Trophy className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">{toast.message}</div>
            {toast.xp && (
              <div className="text-[11px] font-mono text-purple-300">+{toast.xp} XP sincronizados no Firestore</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CalculusRpgApp />
    </AuthProvider>
  );
}
