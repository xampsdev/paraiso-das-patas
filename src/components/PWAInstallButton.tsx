import React, { useState } from 'react';
import { Download, Share, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Se já estiver rodando em modo standalone instalado
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow">
        <Check className="w-3.5 h-3.5" />
        <span>Instalado!</span>
      </div>
    );
  }

  // Para Android, Chrome, Edge, etc.
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        aria-label="Instalar aplicativo de presença na tela inicial"
        className={`flex items-center gap-1.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-md ${
          compact
            ? 'bg-[#fffe42] text-[#142e53] px-3 py-1.5 text-xs hover:bg-yellow-300'
            : 'bg-[#fffe42] text-[#142e53] px-3.5 py-2 text-xs md:text-sm hover:bg-yellow-300'
        }`}
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>
    );
  }

  // Para iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#fffe42] border border-[#fffe42]/40 px-2.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-800 border border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#142e53] text-[#fffe42] flex items-center justify-center font-black text-lg">
                    🐾
                  </div>
                  <div>
                    <h3 className="font-bold text-[#142e53] text-base">Instalar no iPhone</h3>
                    <p className="text-xs text-slate-500">Acesse com 1 toque sem abrir o Safari</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 my-4 text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#142e53] text-[#fffe42] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span>
                    Toque no botão <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />) na barra inferior do Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#142e53] text-[#fffe42] flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span>
                    Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#142e53] text-[#fffe42] flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span>
                    Confirme em <strong>Adicionar</strong> no canto superior direito.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#142e53] text-white font-bold text-sm shadow hover:bg-[#0c1d35] transition"
              >
                Entendi!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
