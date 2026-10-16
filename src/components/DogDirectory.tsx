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
      <div className="flex items-center justify-between gap-3 bg-[#142e53] text-white p-4 rounded-3xl shadow-sm">
        <div>
          <h3 className="font-black text-base sm:text-lg text-[#fffe42] flex items-center gap-2">
            <DogIcon className="w-5 h-5" />
            <span>Cadastro de Cães</span>
          </h3>
          <p className="text-xs text-slate-200 mt-0.5">
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
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar cão ou tutor..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#142e53] shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
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
                ? 'bg-[#142e53] text-[#fffe42]'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Ativos ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('inativos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'inativos'
                ? 'bg-[#142e53] text-[#fffe42]'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Inativos ({inactiveCount})
          </button>
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'todos'
                ? 'bg-[#142e53] text-[#fffe42]'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Todos ({dogs.length})
          </button>
        </div>
      </div>

      {/* Dog cards list */}
      {filteredDogs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700">Nenhum cão encontrado</p>
          <p className="text-xs text-slate-500 mt-1">Cadastre novos pets ou ajuste a busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDogs.map((dog) => (
            <div
              key={dog.id}
              className={`p-4 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between ${
                !dog.ativo ? 'opacity-60 bg-slate-50' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#142e53] text-[#fffe42] flex items-center justify-center font-black text-lg shadow-inner">
                      {dog.nome.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-[#142e53] flex items-center gap-1.5">
                        <span>{dog.nome}</span>
                        {!dog.ativo && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                            Inativo
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        {dog.tutor_nome}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditDogClick(dog)}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#142e53] hover:bg-slate-100 transition"
                    title="Editar cão"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Observações / Cuidados */}
                {dog.observacoes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{dog.observacoes}</span>
                  </div>
                )}
              </div>

              {/* Bottom Phone & Contact */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {dog.telefone}
                </span>

                <a
                  href={getWhatsAppLink(dog)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
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
