import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  LogIn,
  LogOut,
  Clock,
  Phone,
  MessageCircle,
  AlertCircle,
  FileText,
  User,
  Plus,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { Dog, Checkin, AttendanceStatus, FilterTab } from '../types';
import { formatTimeShort, calculateDuration } from '../lib/dataService';

interface DailyPanelProps {
  dogs: Dog[];
  todayCheckins: Checkin[];
  selectedDate: string;
  isToday: boolean;
  isLoading: boolean;
  onCheckinClick: (dogId: string) => Promise<void>;
  onCheckoutClick: (dog: Dog, checkin: Checkin) => void;
  onEditNotesClick: (dog: Dog, checkin: Checkin) => void;
  onNewDogClick: () => void;
  onRefresh: () => void;
}

export const DailyPanel: React.FC<DailyPanelProps> = ({
  dogs,
  todayCheckins,
  selectedDate,
  isToday,
  isLoading,
  onCheckinClick,
  onCheckoutClick,
  onEditNotesClick,
  onNewDogClick,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('todos');
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Map checkins by dog_id for fast lookup
  const checkinByDogId = useMemo(() => {
    const map = new Map<string, Checkin>();
    for (const c of todayCheckins) {
      map.set(c.dog_id, c);
    }
    return map;
  }, [todayCheckins]);

  // Combine dogs with their today status
  const dogsWithStatus = useMemo(() => {
    return dogs
      .filter((d) => d.ativo)
      .map((dog) => {
        const checkin = checkinByDogId.get(dog.id);
        let status: AttendanceStatus = 'ausente';
        let duration: string | undefined = undefined;

        if (checkin) {
          if (checkin.hora_saida) {
            status = 'concluido';
            duration = calculateDuration(checkin.hora_entrada, checkin.hora_saida);
          } else {
            status = 'no_espaco';
            duration = calculateDuration(checkin.hora_entrada, null);
          }
        }

        return {
          dog,
          checkin,
          status,
          duration,
        };
      });
  }, [dogs, checkinByDogId]);

  // Counts for tabs and metrics
  const counts = useMemo(() => {
    let noEspaco = 0;
    let concluidos = 0;
    let ausentes = 0;

    dogsWithStatus.forEach((item) => {
      if (item.status === 'no_espaco') noEspaco++;
      else if (item.status === 'concluido') concluidos++;
      else ausentes++;
    });

    return {
      total: dogsWithStatus.length,
      noEspaco,
      concluidos,
      ausentes,
    };
  }, [dogsWithStatus]);

  // Filtered dogs based on tab and search query
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return dogsWithStatus.filter((item) => {
      // Tab filter
      if (activeTab === 'no_espaco' && item.status !== 'no_espaco') return false;
      if (activeTab === 'concluidos' && item.status !== 'concluido') return false;
      if (activeTab === 'ausentes' && item.status !== 'ausente') return false;

      // Search filter (matches dog name or tutor name)
      if (term) {
        const nameMatch = item.dog.nome.toLowerCase().includes(term);
        const tutorMatch = item.dog.tutor_nome.toLowerCase().includes(term);
        return nameMatch || tutorMatch;
      }

      return true;
    });
  }, [dogsWithStatus, activeTab, searchTerm]);

  const handleFastCheckin = async (dogId: string) => {
    setCheckingInId(dogId);
    try {
      await onCheckinClick(dogId);
    } finally {
      setCheckingInId(null);
    }
  };

  const getWhatsAppLink = (dog: Dog) => {
    const cleanPhone = dog.telefone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = encodeURIComponent(
      `Olá ${dog.tutor_nome}! Tudo bem? Estou entrando em contato do Paraíso das Patas sobre o(a) ${dog.nome} 🐶.`
    );
    return `https://wa.me/${phoneWithCountry}?text=${message}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab('todos')}
          className={`p-2.5 sm:p-3 rounded-2xl text-left transition transform active:scale-95 border ${
            activeTab === 'todos'
              ? 'bg-[#142e53] text-white border-[#142e53] shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block opacity-75">
            Total
          </span>
          <p className="text-lg sm:text-2xl font-black mt-0.5">{counts.total}</p>
        </button>

        <button
          onClick={() => setActiveTab('no_espaco')}
          className={`p-2.5 sm:p-3 rounded-2xl text-left transition transform active:scale-95 border relative overflow-hidden ${
            activeTab === 'no_espaco'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block">
              No Espaço
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-lg sm:text-2xl font-black mt-0.5 text-emerald-400 sm:text-inherit">
            {counts.noEspaco}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('concluidos')}
          className={`p-2.5 sm:p-3 rounded-2xl text-left transition transform active:scale-95 border ${
            activeTab === 'concluidos'
              ? 'bg-[#142e53] text-[#fffe42] border-[#142e53] shadow-md'
              : 'bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block opacity-75">
            Concluídos
          </span>
          <p className="text-lg sm:text-2xl font-black mt-0.5">{counts.concluidos}</p>
        </button>

        <button
          onClick={() => setActiveTab('ausentes')}
          className={`p-2.5 sm:p-3 rounded-2xl text-left transition transform active:scale-95 border ${
            activeTab === 'ausentes'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-300'
          }`}
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block opacity-75">
            Ausentes
          </span>
          <p className="text-lg sm:text-2xl font-black mt-0.5">{counts.ausentes}</p>
        </button>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Busca instantânea por nome do cão ou tutor..."
          className="w-full pl-10 pr-9 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#142e53] focus:border-transparent shadow-xs transition"
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('todos')}
          className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTab === 'todos'
              ? 'bg-[#142e53] text-[#fffe42] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Todos ({counts.total})
        </button>

        <button
          onClick={() => setActiveTab('no_espaco')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'no_espaco'
              ? 'bg-[#142e53] text-[#fffe42] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>No Espaço ({counts.noEspaco})</span>
        </button>

        <button
          onClick={() => setActiveTab('concluidos')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTab === 'concluidos'
              ? 'bg-[#142e53] text-[#fffe42] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Concluídos ({counts.concluidos})
        </button>

        <button
          onClick={() => setActiveTab('ausentes')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTab === 'ausentes'
              ? 'bg-[#142e53] text-[#fffe42] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ausentes ({counts.ausentes})
        </button>
      </div>

      {/* Quick notice when viewing past date */}
      {!isToday && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-900 text-xs font-medium border border-blue-200">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            Visualizando presenças da data: <strong>{selectedDate}</strong>.
          </span>
        </div>
      )}

      {/* List of Dogs */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-[#142e53] mb-2" />
          <p className="text-xs font-semibold">Atualizando lista de presença...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3">
            🐕
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Nenhum cão encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchTerm
              ? `Nenhum resultado com "${searchTerm}". Tente outro termo.`
              : activeTab === 'no_espaco'
              ? 'Não há cães no espaço no momento.'
              : activeTab === 'concluidos'
              ? 'Nenhum cão concluiu a saída ainda hoje.'
              : 'Nenhum cão cadastrado ainda.'}
          </p>
          {dogs.length === 0 && (
            <button
              onClick={onNewDogClick}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142e53] text-[#fffe42] font-bold text-xs shadow hover:bg-[#0c1d35]"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Cão</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(({ dog, checkin, status, duration }) => {
            const isInside = status === 'no_espaco';
            const isFinished = status === 'concluido';
            const isAbsent = status === 'ausente';

            return (
              <div
                key={dog.id}
                className={`p-4 rounded-3xl bg-white border transition-all shadow-xs ${
                  isInside
                    ? 'border-emerald-300 ring-1 ring-emerald-200/80 bg-gradient-to-r from-emerald-50/40 to-white'
                    : isFinished
                    ? 'border-slate-200 opacity-90'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Dog Header Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {/* Dog Avatar Paw Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-inner ${
                        isInside
                          ? 'bg-emerald-500 text-white'
                          : isFinished
                          ? 'bg-[#142e53] text-[#fffe42]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {dog.nome.substring(0, 1)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-[#142e53] tracking-tight">
                          {dog.nome}
                        </h4>

                        {/* Status Chip */}
                        {isInside && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            No Espaço
                          </span>
                        )}
                        {isFinished && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            Concluído
                          </span>
                        )}
                        {isAbsent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/60">
                            Não chegou
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          {dog.tutor_nome}
                        </span>

                        <span className="text-slate-300">•</span>

                        <a
                          href={getWhatsAppLink(dog)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                          title="Abrir WhatsApp com o tutor"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Duration or Entrance Time */}
                  {checkin && (
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center justify-end gap-1 text-xs font-black text-[#142e53]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTimeShort(checkin.hora_entrada)}</span>
                        {checkin.hora_saida && (
                          <>
                            <span className="text-slate-400">→</span>
                            <span>{formatTimeShort(checkin.hora_saida)}</span>
                          </>
                        )}
                      </div>
                      {duration && (
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {isInside ? `⏱️ ${duration}` : `Total: ${duration}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Permanent notes (allergies/diet) if present */}
                {dog.observacoes && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="line-clamp-1">{dog.observacoes}</span>
                  </div>
                )}

                {/* Day's note if present */}
                {checkin?.observacao_dia && (
                  <div className="mt-2 px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-[#142e53] text-[11px] flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 line-clamp-1">
                      <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <span><strong>Nota do dia:</strong> {checkin.observacao_dia}</span>
                    </div>
                    <button
                      onClick={() => onEditNotesClick(dog, checkin)}
                      className="text-blue-600 hover:text-blue-800 text-[10px] font-bold underline flex-shrink-0 ml-1"
                    >
                      Editar
                    </button>
                  </div>
                )}

                {/* Bottom Action Row - Optimized for 1-Touch on Mobile */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  {/* Status 1: Ausente -> 1 Touch Check-in */}
                  {isAbsent && (
                    <button
                      onClick={() => handleFastCheckin(dog.id)}
                      disabled={checkingInId === dog.id}
                      className="w-full py-2.5 px-4 rounded-2xl bg-[#fffe42] hover:bg-yellow-300 text-[#142e53] font-black text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
                    >
                      <LogIn className="w-4 h-4 stroke-[3]" />
                      <span>{checkingInId === dog.id ? 'Registrando...' : '1-Toque: Entrada (Check-in)'}</span>
                    </button>
                  )}

                  {/* Status 2: No Espaço -> 1 Touch Check-out with simple confirmation modal */}
                  {isInside && checkin && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => onEditNotesClick(dog, checkin)}
                        className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                        title="Adicionar observação do dia"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Nota</span>
                      </button>

                      <button
                        onClick={() => onCheckoutClick(dog, checkin)}
                        className="flex-1 py-2.5 px-4 rounded-2xl bg-[#142e53] hover:bg-[#0c1d35] text-[#fffe42] font-black text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-95"
                      >
                        <LogOut className="w-4 h-4 stroke-[2.5]" />
                        <span>Check-out (Saída)</span>
                      </button>
                    </div>
                  )}

                  {/* Status 3: Concluído */}
                  {isFinished && checkin && (
                    <div className="flex items-center justify-between w-full text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Presença concluída ({duration})
                      </span>
                      <button
                        onClick={() => onCheckoutClick(dog, checkin)}
                        className="px-2.5 py-1 text-xs text-[#142e53] font-bold rounded-lg hover:bg-slate-100 transition"
                      >
                        Ajustar Horário
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
