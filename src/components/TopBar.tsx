import React from 'react';
import { UserStats } from '../types/calculus';
import { Flame, Zap, LogIn, LogOut, Database, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  user: UserStats;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, currentView, onNavigate }) => {
  const { currentUser, loginWithGoogle, logout, isFirebaseConnected } = useAuth();
  const xpPercent = Math.round((user.currentXp / user.nextLevelXp) * 100);

  const navItems = [
    { id: 'command', label: 'Painel' },
    { id: 'planner', label: 'Organização' },
    { id: 'arena', label: 'Arena' },
    { id: 'tutor', label: 'Tutor' },
    { id: 'library', label: 'Materiais' },
    { id: 'diagnostic', label: 'Minhas provas' },
    { id: 'skills', label: 'Árvore de Talentos' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c1019] border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            type="button" 
            onClick={() => onNavigate('command')} 
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-purple-900/30 group-hover:scale-105 transition-transform">
              ∫x
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white font-display flex items-center gap-2 whitespace-nowrap">
                CALCULUS RPG
                <span className="hidden sm:inline text-[10px] font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  UFBA MATA02
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean 1-line Navigation Links */}
        <nav aria-label="Navegação principal" className="hidden 2xl:flex items-center gap-4 text-xs font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-purple-400 border-b-2 border-purple-500 font-semibold'
                    : 'hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: RPG Progress, Focus & Firebase Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Firestore indicator */}
          <div 
            className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-400"
            title={isFirebaseConnected ? "Firestore conectado online" : "Firestore em modo cache"}
          >
            <Database className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-400' : 'text-purple-400'}`} />
            <span>Firestore</span>
          </div>

          {/* Streak Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300/90 bg-amber-950/30 border border-amber-900/40 px-2.5 py-1 rounded-md">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold tabular-nums">{user.streakDays}d</span>
          </div>

          {/* Level and XP Bar */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 rounded-md bg-purple-900/60 border border-purple-600/40 flex items-center justify-center text-[11px] font-bold text-purple-200 font-mono">
              L{user.level}
            </div>
            <div className="flex flex-col gap-1 min-w-[65px] sm:min-w-[80px]">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                <span>XP</span>
                <span>{user.currentXp}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, xpPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-800/50 pl-2.5 pr-1.5 py-1 rounded-lg text-xs">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-5 h-5 rounded-full" />
              ) : (
                <UserIcon className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-slate-200 font-medium max-w-[90px] truncate hidden sm:inline">
                {currentUser.displayName || 'Estudante'}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Sair da conta"
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-purple-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Entrar com Google</span>
              <span className="sm:hidden">Entrar</span>
            </button>
          )}
        </div>
      </div>
      <nav aria-label="Navegação principal compacta" className="2xl:hidden flex gap-5 overflow-x-auto text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 pb-1">
        {navItems.map(item => <button key={item.id} onClick={() => onNavigate(item.id)} aria-current={currentView === item.id ? 'page' : undefined} className={`shrink-0 pb-1 border-b-2 ${currentView === item.id ? 'text-teal-300 border-teal-400' : 'border-transparent hover:text-white'}`}>{item.label}</button>)}
      </nav>
    </header>
  );
};
