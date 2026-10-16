import React, { useState, useEffect } from 'react';
import { Dog as DogIcon, X, Check, Trash2, Phone, User, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { Dog } from '../types';

interface DogModalProps {
  isOpen: boolean;
  dogToEdit: Dog | null;
  onClose: () => void;
  onSave: (dogData: Omit<Dog, 'id' | 'created_at'>, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const DogModal: React.FC<DogModalProps> = ({
  isOpen,
  dogToEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [nome, setNome] = useState('');
  const [tutorNome, setTutorNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (dogToEdit) {
      setNome(dogToEdit.nome);
      setTutorNome(dogToEdit.tutor_nome);
      setTelefone(dogToEdit.telefone);
      setObservacoes(dogToEdit.observacoes || '');
      setAtivo(dogToEdit.ativo);
    } else {
      setNome('');
      setTutorNome('');
      setTelefone('');
      setObservacoes('');
      setAtivo(true);
    }
    setErrorMsg('');
  }, [dogToEdit, isOpen]);

  // Phone mask for Brazilian numbers
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length <= 11) {
      let formatted = raw;
      if (raw.length > 2) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
      }
      if (raw.length > 7) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
      }
      setTelefone(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg('Informe o nome do cão.');
      return;
    }
    if (!tutorNome.trim()) {
      setErrorMsg('Informe o nome do tutor.');
      return;
    }
    if (!telefone.trim()) {
      setErrorMsg('Informe o telefone do tutor.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave(
        {
          nome: nome.trim(),
          tutor_nome: tutorNome.trim(),
          telefone: telefone.trim(),
          observacoes: observacoes.trim() || null,
          ativo,
        },
        dogToEdit ? dogToEdit.id : undefined
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar cão';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!dogToEdit || !onDelete) return;
    if (window.confirm(`Tem certeza que deseja remover o cadastro de ${dogToEdit.nome}?`)) {
      setIsSubmitting(true);
      try {
        await onDelete(dogToEdit.id);
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao deletar';
        setErrorMsg(msg);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0d1c31] shadow-2xl text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-[#1b3356] overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-[#142e53] dark:bg-[#091424] text-white p-5 flex justify-between items-center border-b border-[#0c1d35] dark:border-[#1b3356]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black">
              <DogIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {dogToEdit ? `Editar ${dogToEdit.nome}` : 'Cadastrar Novo Cão'}
              </h3>
              <p className="text-xs text-slate-200 dark:text-slate-300">
                {dogToEdit ? 'Atualize os dados e contatos' : 'Adicione o pet à lista da creche'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
              {errorMsg}
            </div>
          )}

          {/* Nome do cão */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <span>Nome do Cão *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Thor, Mel, Pipoca..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
              />
            </div>
          </div>

          {/* Nome do Tutor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Nome do Tutor(a) *</span>
            </label>
            <input
              type="text"
              required
              value={tutorNome}
              onChange={(e) => setTutorNome(e.target.value)}
              placeholder="Ex: Carlos Silva"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
            />
          </div>

          {/* Telefone / WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Telefone / WhatsApp *</span>
            </label>
            <input
              type="tel"
              required
              value={telefone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(11) 98765-4321"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observações Fixo (Saúde, Alergias, Ração, Medicamentos)</span>
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Alérgico a frango, toma remédio às 14h, sociável com outros cães..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42]"
            />
          </div>

          {/* Status Ativo / Inativo */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#12243d] border border-slate-200 dark:border-[#1e3a63]">
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Status do Cão</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {ativo ? 'Cão ativo (aparece no painel diário)' : 'Inativo (arquivado temporariamente)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAtivo(!ativo)}
              className="text-[#142e53] focus:outline-none"
            >
              {ativo ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {dogToEdit && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition active:scale-95"
                title="Excluir cão"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-[#1e3a63] bg-white dark:bg-[#12243d] text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#182f4e] transition active:scale-95"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-[#fffe42] hover:bg-yellow-300 text-[#142e53] font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Salvando...' : dogToEdit ? 'Atualizar' : 'Cadastrar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
