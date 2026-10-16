import React from 'react';
import { ClipboardList, Dog as DogIcon, Calendar, Settings } from 'lucide-react';

interface BottomNavProps {
  activeScreen: 'painel' | 'caes' | 'historico';
  onSelectScreen: (screen: 'painel' | 'caes' | 'historico') => void;
  onOpenSettings: () => void;
  activeDogsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenSettings,
  activeDogsCount,
}) => {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#091424]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1b3356] pb-safe shadow-lg transition-colors"
    >
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around">
        {/* Painel Diário */}
        <button
          onClick={() => onSelectScreen('painel')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeScreen === 'painel'
              ? 'text-[#142e53] dark:text-[#fffe42] font-black'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              activeScreen === 'painel' ? 'bg-[#fffe42] text-[#142e53]' : ''
            }`}
          >
            <ClipboardList className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Painel</span>
        </button>

        {/* Cadastro de Cães */}
        <button
          onClick={() => onSelectScreen('caes')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeScreen === 'caes'
              ? 'text-[#142e53] dark:text-[#fffe42] font-black'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition relative ${
              activeScreen === 'caes' ? 'bg-[#fffe42] text-[#142e53]' : ''
            }`}
          >
            <DogIcon className="w-5 h-5 stroke-[2.5]" />
            {activeDogsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#142e53] text-[#fffe42] text-[9px] font-black rounded-full flex items-center justify-center">
                {activeDogsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Cães</span>
        </button>

        {/* Histórico */}
        <button
          onClick={() => onSelectScreen('historico')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeScreen === 'historico'
              ? 'text-[#142e53] dark:text-[#fffe42] font-black'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              activeScreen === 'historico' ? 'bg-[#fffe42] text-[#142e53]' : ''
            }`}
          >
            <Calendar className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Histórico</span>
        </button>

        {/* Supabase Config */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center py-1 px-3 rounded-2xl text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all font-medium"
        >
          <div className="p-1.5 rounded-xl">
            <Settings className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Configurações</span>
        </button>
      </div>
    </nav>
  );
};
