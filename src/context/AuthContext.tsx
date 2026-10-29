import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserStats, SkillNode } from '../types/calculus';
import { newUserStats, newUserSkills } from '../data/newUser';

interface AuthContextType {
  currentUser: User | null; userStats: UserStats; skills: SkillNode[];
  isLoading: boolean; isFirebaseConnected: boolean; authError: string | null;
  loginWithGoogle: () => Promise<void>; logout: () => Promise<void>;
  awardXp: (amount: number, reason: string) => Promise<void>;
  updateSkillMastery: (skillId: string, success: boolean) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const errors: Record<string, string> = {
  'auth/unauthorized-domain': 'Este domínio não está autorizado. No Firebase: Authentication → Settings → Authorized domains, adicione localhost e o domínio de publicação.',
  'auth/operation-not-allowed': 'Ative Google em Firebase → Authentication → Sign-in method e configure o e-mail de suporte.',
  'auth/popup-blocked': 'O navegador bloqueou a janela de login. Permita pop-ups ou abra o site no Chrome/Edge.',
  'auth/popup-closed-by-user': 'A janela de login foi fechada. Você pode tentar novamente.',
  'auth/invalid-api-key': 'A configuração do Firebase é inválida. Confira firebase-applet-config.json.',
  'auth/network-request-failed': 'Não foi possível conectar ao Google. Verifique sua conexão e tente em um navegador externo.',
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStats, setStats] = useState(newUserStats);
  const [skills, setSkills] = useState(newUserSkills);
  const [isLoading, setLoading] = useState(true);
  const [isFirebaseConnected, setConnected] = useState(false);
  const [authError, setError] = useState<string | null>(null);
  const identity = useRef<string | null>(null);
  const statsRef = useRef(userStats); statsRef.current = userStats;
  const skillsRef = useRef(skills); skillsRef.current = skills;
  useEffect(() => {
    let stopProfile: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(auth, user => {
      stopProfile?.(); identity.current = user?.uid || null;
      setCurrentUser(user); setStats(newUserStats(user?.displayName || 'Estudante'));
      setSkills(newUserSkills()); setConnected(false); setError(null);
      if (!user) { setLoading(false); return; }
      setLoading(true);
      const profile = doc(db, 'users', user.uid);
      stopProfile = onSnapshot(profile, snapshot => {
        if (identity.current !== user.uid) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          setStats({ ...newUserStats(user.displayName || 'Estudante'), ...(data.stats || {}), name: user.displayName || data.name || 'Estudante' });
          if (Array.isArray(data.skills)) setSkills(newUserSkills().map(base => ({ ...base, ...data.skills.find((s: SkillNode) => s.id === base.id) })));
          setConnected(!snapshot.metadata.fromCache); setLoading(false);
        } else {
          const stats = newUserStats(user.displayName || 'Estudante');
          setDoc(profile, { uid: user.uid, name: stats.name, level: 1, currentXp: 0, stats, skills: newUserSkills(), createdAt: new Date().toISOString() }).catch(() => {
            if (identity.current === user.uid) { setError('Login concluído, mas não foi possível salvar o perfil. Verifique as regras do Firestore.'); setLoading(false); }
          });
        }
      }, () => { if (identity.current === user.uid) { setError('Não foi possível sincronizar seu progresso. Verifique a conexão e as regras do Firestore.'); setConnected(false); setLoading(false); } });
    });
    return () => { stopAuth(); stopProfile?.(); };
  }, []);
  const persist = async (changes: Record<string, unknown>) => {
    const user = auth.currentUser;
    if (!user) return;
    try { await setDoc(doc(db, 'users', user.uid), { ...changes, uid: user.uid, name: user.displayName || 'Estudante', updatedAt: new Date().toISOString() }, { merge: true }); }
    catch { setError('Seu progresso ainda não foi sincronizado. Verifique a conexão e tente novamente.'); throw new Error('Falha ao sincronizar progresso'); }
  };
  const loginWithGoogle = async () => {
    setError(null);
    try { googleProvider.setCustomParameters({ prompt: 'select_account' }); await signInWithPopup(auth, googleProvider); }
    catch (err: any) { setError(errors[err.code] || `Não foi possível entrar com Google (${err.code || 'erro desconhecido'}).`); }
  };
  const logout = async () => { try { await signOut(auth); } catch { setError('Não foi possível sair. Tente novamente.'); } };
  const awardXp = async (amount: number) => {
    if (!auth.currentUser) throw new Error('Entre com Google para salvar XP.');
    const prev = statsRef.current;
    const updated = { ...prev, currentXp: prev.currentXp + amount, recentAttemptsCount: prev.recentAttemptsCount + 1 };
    while (updated.currentXp >= updated.nextLevelXp) { updated.level++; updated.nextLevelXp = Math.round(updated.nextLevelXp * 1.5); }
    await persist({ stats: updated, level: updated.level, currentXp: updated.currentXp });
  };
  const updateSkillMastery = async (id: string, success: boolean) => {
    if (!auth.currentUser) return;
    const updated = skillsRef.current.map(s => {
      if (s.id !== id) return s;
      const totalAttempts = s.totalAttempts + 1, successfulAttempts = s.successfulAttempts + Number(success);
      const masteryScore = Math.round(successfulAttempts / totalAttempts * 100);
      return { ...s, totalAttempts, successfulAttempts, masteryScore, status: masteryScore >= 75 ? 'mastered' as const : 'learning' as const };
    });
    await persist({ skills: updated });
  };
  return <AuthContext.Provider value={{ currentUser, userStats, skills, isLoading, isFirebaseConnected, authError, loginWithGoogle, logout, awardXp, updateSkillMastery }}>{children}</AuthContext.Provider>;
};
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider necessário'); return context; }
