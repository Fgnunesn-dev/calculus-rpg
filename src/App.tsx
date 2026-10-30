import React, { useEffect, useState } from 'react';
import { ExamWorkspace } from './components/ExamWorkspace';
import { ExamReport } from './types/exam';
import { privateFetch } from './lib/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopBar } from './components/TopBar';
import { LearningArena } from './components/LearningArena';
import { AiTutor } from './components/AiTutor';
import { DocumentLibrary } from './components/DocumentLibrary';
import { SkillTree } from './components/SkillTree';
import { StudyPlanner } from './components/StudyPlanner';
import { PATH_EXERCISES } from './data/studyPath';
import { INITIAL_EXERCISES } from './data/initialData';
import { ExerciseItem } from './types/calculus';
import { Trophy } from 'lucide-react';
import { examProgress, skillsWithExamEvidence } from './lib/examProgress';

function CalculusRpgApp() {
  const { currentUser, userStats, skills, awardXp, updateSkillMastery, authError, isLoading } = useAuth();
  const [reports, setReports] = useState<ExamReport[]>([]);
  const assessedSkills = skillsWithExamEvidence(skills, reports);
  const recommendedModules = examProgress(reports).recommended;
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [plannerModule, setPlannerModule] = useState<string | undefined>();
  const navigate = (view: string) => { if (view.startsWith('planner:')) { setPlannerModule(view.slice(8)); setCurrentView('planner'); } else { setPlannerModule(undefined); setCurrentView(view); } };
  useEffect(() => {
    if (!currentUser) return;
    let active = true; setReportsLoading(true);
    privateFetch('/api/exams').then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Falha ao carregar provas.'); if (active) setReports(data.exams); }).catch(err => { if (active) setReportsError(err.message); }).finally(() => { if (active) setReportsLoading(false); });
    return () => { active = false; };
  }, [currentUser?.uid]);
  const [currentView, setCurrentView] = useState<string>('command');
  const [exercises, setExercises] = useState<ExerciseItem[]>([...INITIAL_EXERCISES, ...PATH_EXERCISES]);
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
    try { await awardXp(amount, reason); showToast(`+${amount} XP: ${reason}`, amount); }
    catch (err: any) { showToast(err.message); throw err; }
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
        associatedSkills: [],
        enunciadoLatex: prompt,
        sourceDocument: 'Upload Recente do Estudante',
        sourcePage: 1,
        expectedAnswerLatex: '',
        contextNotes: 'Exercício extraído ou de reforço. Não há gabarito oficial fornecido: confira a resolução e as restrições contidas no enunciado sem presumir um resultado.',
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
        onNavigate={navigate}
      />
      {authError && <div role="alert" className="border-b border-amber-900 bg-amber-950/30 text-amber-200 px-5 py-3 text-sm">{authError}</div>}
      {isLoading && <p role="status" className="text-sm text-slate-400 px-5 py-3">Conectando seu perfil…</p>}

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {currentView === 'command' && (
          <ExamWorkspace view="dashboard" reports={reports} loading={reportsLoading} error={reportsError} onReport={report => setReports(prev => [report, ...prev])} onNavigate={navigate} onPractice={handlePracticeFromDocument} />
        )}

        {currentView === 'planner' && <StudyPlanner key={plannerModule || 'all'} initialModule={plannerModule} recommendedModules={recommendedModules} onPractice={handleStartMission} />}

        {currentView === 'arena' && (
          <LearningArena
            key={selectedExerciseId}
            currentExercise={currentExercise}
            onSelectAnotherExercise={(id) => setSelectedExerciseId(id)}
            availableExercises={exercises}
            onAwardXp={async (xp, reason) => {
              await handleAwardXp(xp, reason);
              if (currentExercise.associatedSkills[0]) {
                updateSkillMastery(currentExercise.associatedSkills[0], true).catch(() => {});
              }
            }}
          />
        )}

        <div hidden={currentView !== 'tutor'}><AiTutor /></div>

        {currentView === 'library' && (
          <DocumentLibrary
            onSelectExerciseToPractice={handlePracticeFromDocument}
          />
        )}

        {currentView === 'diagnostic' && (
          <ExamWorkspace view="exams" reports={reports} loading={reportsLoading} error={reportsError} onReport={report => setReports(prev => [report, ...prev])} onNavigate={navigate} onPractice={handlePracticeFromDocument} />
        )}

        {currentView === 'skills' && (
          <SkillTree
            skills={assessedSkills}
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
      <SessionApp />
    </AuthProvider>
  );
}

function SessionApp() { const { currentUser } = useAuth(); return <CalculusRpgApp key={currentUser?.uid || 'guest'} />; }
