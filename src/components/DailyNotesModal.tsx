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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl text-slate-800 border border-slate-100 overflow-hidden">
        <div className="bg-[#142e53] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#fffe42]" />
            <h3 className="font-bold text-sm">Observação do Dia: {dog.nome}</h3>
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53]"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-1/2 py-2.5 rounded-xl bg-[#142e53] text-[#fffe42] font-bold text-xs shadow hover:bg-[#0c1d35] flex items-center justify-center gap-1 transition"
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
