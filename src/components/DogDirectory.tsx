import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit3, Phone, MessageCircle, AlertCircle, User, Dog as DogIcon } from 'lucide-react';
import { Dog } from '../types';

interface DogDirectoryProps {
  dogs: Dog[];
  onNewDogClick: () => void;
  onEditDogClick: (dog: Dog) => void;
}

export const DogDirectory: React.FC<DogDirectoryProps> = ({
  dogs,
  onNewDogClick,
  onEditDogClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('ativos');

  const filteredDogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return dogs.filter((dog) => {
      if (filterStatus === 'ativos' && !dog.ativo) return false;
      if (filterStatus === 'inativos' && dog.ativo) return false;

      if (term) {
        const nameMatch = dog.nome.toLowerCase().includes(term);
        const tutorMatch = dog.tutor_nome.toLowerCase().includes(term);
        return nameMatch || tutorMatch;
      }

      return true;
    });
  }, [dogs, filterStatus, searchTerm]);

  const activeCount = dogs.filter((d) => d.ativo).length;
  const inactiveCount = dogs.length - activeCount;

  const getWhatsAppLink = (dog: Dog) => {
    const cleanPhone = dog.telefone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    return `https://wa.me/${phoneWithCountry}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="flex items-center justify-between gap-3 bg-[#142e53] dark:bg-[#091424] text-white p-4 rounded-3xl shadow-sm border border-transparent dark:border-[#1b3356]">
        <div>
          <h3 className="font-black text-base sm:text-lg text-[#fffe42] flex items-center gap-2">
            <DogIcon className="w-5 h-5" />
            <span>Cadastro de Cães</span>
          </h3>
          <p className="text-xs text-slate-200 dark:text-slate-400 mt-0.5">
            {activeCount} cães ativos cadastrados na creche
          </p>
        </div>

        <button
          onClick={onNewDogClick}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#fffe42] text-[#142e53] font-black text-xs sm:text-sm hover:bg-yellow-300 transition shadow active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Cão</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar cão ou tutor..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#0d1c31] border border-slate-200 dark:border-[#1e3a63] text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#142e53] dark:focus:ring-[#fffe42] shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('ativos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'ativos'
                ? 'bg-[#142e53] dark:bg-[#1b365d] text-[#fffe42]'
                : 'bg-white dark:bg-[#0d1c31] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1b3356]'
            }`}
          >
            Ativos ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('inativos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'inativos'
                ? 'bg-[#142e53] dark:bg-[#1b365d] text-[#fffe42]'
                : 'bg-white dark:bg-[#0d1c31] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1b3356]'
            }`}
          >
            Inativos ({inactiveCount})
          </button>
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'todos'
                ? 'bg-[#142e53] dark:bg-[#1b365d] text-[#fffe42]'
                : 'bg-white dark:bg-[#0d1c31] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1b3356]'
            }`}
          >
            Todos ({dogs.length})
          </button>
        </div>
      </div>

      {/* Dog cards list */}
      {filteredDogs.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#0d1c31] rounded-3xl border border-slate-200 dark:border-[#1b3356]">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhum cão encontrado</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cadastre novos pets ou ajuste a busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDogs.map((dog) => (
            <div
              key={dog.id}
              className={`p-4 rounded-3xl bg-white dark:bg-[#0d1c31] border border-slate-200 dark:border-[#1b3356] hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs flex flex-col justify-between ${
                !dog.ativo ? 'opacity-60 bg-slate-50 dark:bg-[#08121f]' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#142e53] text-[#fffe42] flex items-center justify-center font-black text-lg shadow-inner">
                      {dog.nome.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-[#142e53] dark:text-[#fffe42] flex items-center gap-1.5">
                        <span>{dog.nome}</span>
                        {!dog.ativo && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#12243d] text-slate-600 dark:text-slate-400 font-bold">
                            Inativo
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        {dog.tutor_nome}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditDogClick(dog)}
                    className="p-2 rounded-xl text-slate-400 dark:text-slate-400 hover:text-[#142e53] dark:hover:text-[#fffe42] hover:bg-slate-100 dark:hover:bg-[#12243d] transition"
                    title="Editar cão"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Observações / Cuidados */}
                {dog.observacoes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{dog.observacoes}</span>
                  </div>
                )}
              </div>

              {/* Bottom Phone & Contact */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1b3356] flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {dog.telefone}
                </span>

                <a
                  href={getWhatsAppLink(dog)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
