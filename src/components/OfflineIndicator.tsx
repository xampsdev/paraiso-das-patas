import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Status de conectividade"
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-sm flex items-center justify-between gap-2.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-bounce"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 flex-shrink-0" />
        <span>Modo Offline: Operando no cache local do celular</span>
      </div>
      <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
    </aside>
  );
};
