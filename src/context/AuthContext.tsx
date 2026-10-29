import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, onAuthStateChanged, signInWithPopup, signOut 
} from 'firebase/auth';
import { 
  doc, getDoc, setDoc, updateDoc, collection, onSnapshot 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import { UserStats, SkillNode } from '../types/calculus';
import { INITIAL_USER, INITIAL_SKILLS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  userStats: UserStats;
  skills: SkillNode[];
  isLoading: boolean;
  isFirebaseConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsFabricio: () => void;
  logout: () => Promise<void>;
  awardXp: (amount: number, reason: string) => Promise<void>;
  updateSkillMastery: (skillId: string, deltaSuccess: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER);
  const [skills, setSkills] = useState<SkillNode[]>(INITIAL_SKILLS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Check connection on boot
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserFromFirestore(user);
      } else {
        // Fallback to Fabricio profile for demonstration
        setUserStats(INITIAL_USER);
        setSkills(INITIAL_SKILLS);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync user profile and skills from Firestore
  const syncUserFromFirestore = async (user: User) => {
    const userDocPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserStats({
          name: data.name || user.displayName || INITIAL_USER.name,
          course: data.course || INITIAL_USER.course,
          university: data.university || INITIAL_USER.university,
          professor: data.professor || INITIAL_USER.professor,
          level: data.level || 1,
          currentXp: data.currentXp || 0,
          nextLevelXp: data.nextLevelXp || 2000,
          streakDays: data.streakDays || 1,
          streakProtected: true,
          focusEnergy: data.focusEnergy ?? 85,
          recentAttemptsCount: data.recentAttemptsCount || 0,
          accuracyRate: data.accuracyRate || 50,
          masteredSkillsCount: data.masteredSkillsCount || 3,
          totalSkillsCount: INITIAL_SKILLS.length,
          title: data.title || INITIAL_USER.title,
        });
      } else {
        // First-time user setup in Firestore
        const newProfile = {
          uid: user.uid,
          name: user.displayName || INITIAL_USER.name,
          email: user.email || 'aluno@ufba.br',
          course: INITIAL_USER.course,
          university: INITIAL_USER.university,
          professor: INITIAL_USER.professor,
          level: 1,
          currentXp: 0,
          nextLevelXp: 1000,
          streakDays: 1,
          focusEnergy: 100,
          accuracyRate: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);

        // Seed initial skills in subcollection /users/{uid}/skills/{skillId}
        for (const skill of INITIAL_SKILLS) {
          const skillRef = doc(db, `users/${user.uid}/skills`, skill.id);
          await setDoc(skillRef, {
            id: skill.id,
            name: skill.name,
            category: skill.category,
            masteryScore: skill.masteryScore,
            status: skill.status,
            totalAttempts: skill.totalAttempts,
            successfulAttempts: skill.successfulAttempts,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Attach realtime listener for skills
      const skillsColPath = `users/${user.uid}/skills`;
      const skillsRef = collection(db, 'users', user.uid, 'skills');
      onSnapshot(skillsRef, (snap) => {
        if (!snap.empty) {
          const loadedSkills: SkillNode[] = [];
          snap.forEach(d => {
            const s = d.data();
            const original = INITIAL_SKILLS.find(orig => orig.id === s.id);
            loadedSkills.push({
              id: s.id,
              name: s.name,
              category: s.category || original?.category || 'limits',
              description: original?.description || '',
              prerequisites: original?.prerequisites || [],
              masteryScore: s.masteryScore ?? 30,
              status: s.status || 'learning',
              totalAttempts: s.totalAttempts || 0,
              successfulAttempts: s.successfulAttempts || 0,
              evidence: original?.evidence || [],
            });
          });
          setSkills(loadedSkills);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, skillsColPath);
      });
    } catch (err: any) {
      console.warn('Could not sync with Firestore (running in offline/mock mode):', err.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const loginAsFabricio = () => {
    setUserStats(INITIAL_USER);
    setSkills(INITIAL_SKILLS);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserStats(INITIAL_USER);
      setSkills(INITIAL_SKILLS);
    } catch (err) {
      console.error('Sign-out Error:', err);
    }
  };

  const awardXp = async (amount: number, reason: string) => {
    setUserStats((prev) => {
      const newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;

      if (newXp >= prev.nextLevelXp) {
        newLevel += 1;
        newNextXp = Math.round(prev.nextLevelXp * 1.5);
      }

      const updated = {
        ...prev,
        currentXp: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        recentAttemptsCount: prev.recentAttemptsCount + 1,
      };

      // Persist to Firestore if logged in
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        updateDoc(userRef, {
          currentXp: newXp,
          level: newLevel,
          nextLevelXp: newNextXp,
          recentAttemptsCount: updated.recentAttemptsCount,
          updatedAt: new Date().toISOString(),
        }).catch(err => {
          console.warn('Firestore updateDoc failed, keeping local state:', err);
        });
      }

      return updated;
    });
  };

  const updateSkillMastery = async (skillId: string, deltaSuccess: boolean) => {
    setSkills((prevSkills) =>
      prevSkills.map((s) => {
        if (s.id !== skillId) return s;
        const total = s.totalAttempts + 1;
        const success = s.successfulAttempts + (deltaSuccess ? 1 : 0);
        const newScore = Math.min(100, Math.round((success / total) * 100));
        const newStatus = newScore >= 75 ? 'mastered' : newScore >= 40 ? 'learning' : 'unstable';

        const updatedSkill: SkillNode = {
          ...s,
          totalAttempts: total,
          successfulAttempts: success,
          masteryScore: newScore,
          status: newStatus,
        };

        if (currentUser) {
          const skillRef = doc(db, `users/${currentUser.uid}/skills`, skillId);
          setDoc(skillRef, {
            id: skillId,
            name: s.name,
            masteryScore: newScore,
            status: newStatus,
            totalAttempts: total,
            successfulAttempts: success,
            updatedAt: new Date().toISOString(),
          }, { merge: true }).catch(err => {
            console.warn('Skill sync error:', err);
          });
        }

        return updatedSkill;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userStats,
        skills,
        isLoading,
        isFirebaseConnected,
        loginWithGoogle,
        loginAsFabricio,
        logout,
        awardXp,
        updateSkillMastery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
