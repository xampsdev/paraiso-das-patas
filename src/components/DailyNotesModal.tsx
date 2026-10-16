import React, { useState } from 'react';
import { FileText, X, Check } from 'lucide-react';
import { Dog, Checkin } from '../types';

interface DailyNotesModalProps {
  isOpen: boolean;
  dog: Dog | null;
  checkin: Checkin | null;
  onClose: () => void;
  onSave: (checkinId: string, observacaoDia: string) => Promise<void>;
}

export const DailyNotesModal: React.FC<DailyNotesModalProps> = ({
  isOpen,
  dog,
  checkin,
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (checkin) {
      setNotes(checkin.observacao_dia || '');
    }
  }, [checkin, isOpen]);

  const handleSave = async () => {
    if (!checkin) return;
    setIsSaving(true);
    try {
      await onSave(checkin.id, notes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !dog || !checkin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0d1c31] shadow-2xl text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#1b3356] overflow-hidden">
        <div className="bg-[#142e53] dark:bg-[#091424] text-white p-4 flex justify-between items-center border-b border-[#0c1d35] dark:border-[#1b3356]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#fffe42]" />
            <h3 className="font-bold text-sm text-white">Observação do Dia: {dog.nome}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Almoçou às 12:30, tomou remédio, comportamento excelente..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-[#182f4e] transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-1/2 py-2.5 rounded-xl bg-[#142e53] dark:bg-[#1a3860] text-[#fffe42] font-bold text-xs shadow hover:bg-[#0c1d35] flex items-center justify-center gap-1 transition border border-transparent dark:border-[#fffe42]/20"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Nota'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
