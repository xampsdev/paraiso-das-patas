import React, { useState } from 'react';
import { LogOut, Clock, X, Check, Heart, Sparkles } from 'lucide-react';
import { Dog, Checkin } from '../types';
import { getCurrentTimeString, formatTimeShort, calculateDuration } from '../lib/dataService';

interface CheckoutModalProps {
  isOpen: boolean;
  dog: Dog | null;
  checkin: Checkin | null;
  onClose: () => void;
  onConfirm: (checkinId: string, horaSaida: string, observacaoDia: string) => Promise<void>;
}

const QUICK_TAGS = [
  'Comeu ração 100%',
  'Brincou muito e descansou',
  'Medicamento administrado',
  'Banho/Tosa realizado',
  'Comportamento excelente',
  'Muito carinhoso hoje',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  dog,
  checkin,
  onClose,
  onConfirm,
}) => {
  const [horaSaida, setHoraSaida] = useState(() => getCurrentTimeString().substring(0, 5));
  const [observacao, setObservacao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (checkin) {
      setObservacao(checkin.observacao_dia || '');
      setHoraSaida(getCurrentTimeString().substring(0, 5));
    }
  }, [checkin, isOpen]);

  const duration = checkin
    ? calculateDuration(checkin.hora_entrada, horaSaida + ':00')
    : '';

  const handleTagClick = (tag: string) => {
    if (observacao.includes(tag)) {
      setObservacao(observacao.replace(tag, '').replace(/,\s*,/g, ',').replace(/^,\s*|\s*,$/g, '').trim());
    } else {
      setObservacao(observacao ? `${observacao}, ${tag}` : tag);
    }
  };

  const handleConfirm = async () => {
    if (!checkin) return;
    setIsSubmitting(true);
    try {
      const fullExitTime = horaSaida.length === 5 ? `${horaSaida}:00` : horaSaida;
      await onConfirm(checkin.id, fullExitTime, observacao);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !dog || !checkin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0d1c31] shadow-2xl text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#1b3356] overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-[#142e53] dark:bg-[#091424] text-white p-5 border-b border-[#0c1d35] dark:border-[#1b3356]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black">
                <LogOut className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#fffe42]">
                Confirmação de Check-out
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="w-13 h-13 rounded-2xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black text-2xl shadow-inner">
              🐾
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">{dog.nome}</h3>
              <p className="text-xs text-slate-200 dark:text-slate-300">
                Tutor(a): <span className="font-semibold text-white">{dog.tutor_nome}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Time summary card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-[#12243d] rounded-2xl border border-slate-200 dark:border-[#1e3a63]">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entrada</span>
              <p className="text-base font-extrabold text-[#142e53] dark:text-[#fffe42] flex items-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                {formatTimeShort(checkin.hora_entrada)}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Saída (Agora)
              </label>
              <input
                type="time"
                value={horaSaida}
                onChange={(e) => setHoraSaida(e.target.value)}
                className="w-full text-base font-extrabold text-[#142e53] dark:text-[#fffe42] bg-white dark:bg-[#091424] border border-slate-300 dark:border-[#1e3a63] rounded-lg px-2 py-0.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
              />
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-[#1e3a63] flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Tempo de permanência:</span>
              <span className="px-2.5 py-1 rounded-full bg-[#142e53] dark:bg-[#1a3860] text-[#fffe42] font-black text-xs shadow-sm border border-transparent dark:border-[#fffe42]/20">
                ⏳ {duration}
              </span>
            </div>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Notas rápidas do dia (opcional):</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = observacao.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition active:scale-95 ${
                      isSelected
                        ? 'bg-[#142e53] text-[#fffe42] border border-[#142e53] dark:border-[#fffe42]'
                        : 'bg-slate-100 dark:bg-[#12243d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a63] hover:bg-slate-200 dark:hover:bg-[#1a3458]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observation text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observação do Dia
            </label>
            <textarea
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Almoçou às 12h, comportamento tranquilo, pronto para ir para casa..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#182f4e] transition active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-2/3 py-3 rounded-2xl bg-[#fffe42] hover:bg-yellow-300 text-[#142e53] font-black text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isSubmitting ? 'Finalizando...' : 'Confirmar Saída'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
