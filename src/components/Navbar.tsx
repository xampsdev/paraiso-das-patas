import React from 'react';
import { Database, Plus, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenNewDog: () => void;
  activeScreen: 'painel' | 'caes' | 'historico';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenNewDog,
}) => {
  const isCloudConnected = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-30 bg-[#142e53] text-white shadow-md border-b border-[#0c1d35] pt-safe">
      <div className="max-w-3xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black text-xl shadow-md transform hover:rotate-6 transition">
            🐾
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-1.5 leading-none">
              <span>Paraíso das Patas</span>
            </h1>
            <p className="text-[10px] text-slate-300 font-medium leading-none mt-1">
              Controle de Presença & Check-in
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Quick New Dog Button on mobile/desktop header */}
          <button
            onClick={onOpenNewDog}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition active:scale-95"
            title="Cadastrar Cão"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Cão</span>
          </button>

          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 border ${
              isCloudConnected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                : 'bg-amber-950/80 text-[#fffe42] border-amber-500/40 hover:bg-amber-900'
            }`}
            title="Configurar Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isCloudConnected ? 'Supabase Conectado' : 'Modo Demo/Local'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-400' : 'bg-[#fffe42] animate-pulse'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
