import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Trash2,
  Edit2
} from 'lucide-react';
import { Checkin, Dog } from '../types';
import {
  formatTimeShort,
  calculateDuration,
  getTodayDateString,
  fetchLast7DaysAttendance,
  DailyAttendanceStat,
} from '../lib/dataService';
import { AttendanceChart7Days } from './AttendanceChart7Days';

interface HistoryViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  checkins: Checkin[];
  dogs: Dog[];
  isLoading: boolean;
  onEditCheckin: (dog: Dog, checkin: Checkin) => void;
  onDeleteCheckin: (checkinId: string) => Promise<void>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  selectedDate,
  onDateChange,
  checkins,
  dogs,
  isLoading,
  onEditCheckin,
  onDeleteCheckin,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);
  const [stats7Days, setStats7Days] = useState<DailyAttendanceStat[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const todayStr = getTodayDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const load7DaysStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await fetchLast7DaysAttendance();
      setStats7Days(data);
    } catch (err) {
      console.warn('Erro ao carregar estatísticas de 7 dias:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    load7DaysStats();
  }, [load7DaysStats, checkins]);

  // Map dogs
  const dogMap = new Map<string, Dog>();
  dogs.forEach((d) => dogMap.set(d.id, d));

  // Change date by offset in days
  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + days);
    const newStr = current.toISOString().split('T')[0];
    onDateChange(newStr);
  };

  // Stats
  const total = checkins.length;
  const inside = checkins.filter((c) => !c.hora_saida).length;
  const completed = checkins.filter((c) => Boolean(c.hora_saida)).length;

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Share report via clipboard
  const handleShareReport = () => {
    const displayDate = formatDateDisplay(selectedDate);
    let report = `🐾 *RELATÓRIO DE PRESENÇA - PARAÍSO DAS PATAS*\n📅 Data: ${displayDate}\n\n`;
    report += `🐶 *Total de Cães*: ${total} (No espaço: ${inside} | Saídas concluídas: ${completed})\n\n`;
    report += `─────────────────────────\n`;

    if (checkins.length === 0) {
      report += `Nenhum check-in registrado nesta data.\n`;
    } else {
      checkins.forEach((c, idx) => {
        const dog = c.dog || dogMap.get(c.dog_id);
        const dogName = dog?.nome || 'Cão';
        const tutor = dog?.tutor_nome || '';
        const entrada = formatTimeShort(c.hora_entrada);
        const saida = c.hora_saida ? formatTimeShort(c.hora_saida) : 'No espaço';
        const dur = calculateDuration(c.hora_entrada, c.hora_saida);

        report += `${idx + 1}. *${dogName}* (${tutor})\n`;
        report += `   ⏰ Entrada: ${entrada} | Saída: ${saida} (${dur})\n`;
        if (c.observacao_dia) {
          report += `   📝 Obs: ${c.observacao_dia}\n`;
        }
        report += `\n`;
      });
    }

    report += `─────────────────────────\nSistema Paraíso das Patas 🐶✨`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Date Header Picker */}
      <div className="bg-[#142e53] dark:bg-[#091424] text-white p-4 rounded-3xl shadow-sm space-y-3 border border-transparent dark:border-[#1b3356]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#fffe42] text-[#142e53] flex items-center justify-center font-black shadow-inner">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Histórico de Presenças</h3>
              <p className="text-xs text-slate-200 dark:text-slate-400">
                {formatDateDisplay(selectedDate)}
                {selectedDate === todayStr ? ' (Hoje)' : selectedDate === yesterdayStr ? ' (Ontem)' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleShareReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fffe42] text-[#142e53] font-black text-xs hover:bg-yellow-300 transition active:scale-95 shadow"
            title="Copiar relatório formatado para o WhatsApp"
          >
            {copiedReport ? <Check className="w-4 h-4 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedReport ? 'Copiado!' : 'Relatório'}</span>
          </button>
        </div>

        {/* Date Selector Navigation Bar */}
        <div className="flex items-center justify-between gap-2 bg-white/10 dark:bg-black/30 p-1.5 rounded-2xl">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-white dark:bg-[#12243d] text-[#142e53] dark:text-[#fffe42] font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-transparent dark:border-[#1e3a63] focus:outline-none focus:ring-2 focus:ring-[#fffe42]"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={() => onDateChange(todayStr)}
                className="px-2.5 py-1.5 rounded-xl bg-[#fffe42] text-[#142e53] font-bold text-xs hover:bg-yellow-300 transition"
              >
                Hoje
              </button>
            )}
          </div>

          <button
            onClick={() => changeDateByDays(1)}
            disabled={selectedDate >= todayStr}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            title="Próximo dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gráfico Recharts de Frequência dos Últimos 7 Dias */}
      <AttendanceChart7Days
        stats={stats7Days}
        selectedDate={selectedDate}
        onSelectDate={onDateChange}
        isLoading={isLoadingStats}
      />

      {/* Daily Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-white dark:bg-[#0d1c31] rounded-2xl border border-slate-200 dark:border-[#1b3356]">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
          <p className="text-xl font-black text-[#142e53] dark:text-[#fffe42] mt-0.5">{total}</p>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">No Espaço</span>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{inside}</p>
        </div>
        <div className="p-3 bg-slate-100 dark:bg-[#12243d] rounded-2xl border border-slate-200 dark:border-[#1b3356]">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Concluídos</span>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">{completed}</p>
        </div>
      </div>

      {/* Checkins List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500">
          <p className="text-xs font-semibold">Carregando histórico do dia...</p>
        </div>
      ) : checkins.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#0d1c31] rounded-3xl border border-slate-200 dark:border-[#1b3356]">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-[#12243d] flex items-center justify-center text-xl mb-2">
            📅
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Sem presenças nesta data</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nenhum check-in registrado em {formatDateDisplay(selectedDate)}.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {checkins.map((item) => {
            const dog = item.dog || dogMap.get(item.dog_id);
            const dogName = dog?.nome || 'Cão';
            const tutor = dog?.tutor_nome || 'Tutor';
            const duration = calculateDuration(item.hora_entrada, item.hora_saida);
            const isCompleted = Boolean(item.hora_saida);

            return (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-white dark:bg-[#0d1c31] border border-slate-200 dark:border-[#1b3356] hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#142e53] text-[#fffe42] flex items-center justify-center font-black text-base shadow-inner">
                      {dogName.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-[#142e53] dark:text-[#fffe42] flex items-center gap-2">
                        <span>{dogName}</span>
                        {isCompleted ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#12243d] text-slate-700 dark:text-slate-300 font-bold">
                            Concluído
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            No Espaço
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        {tutor}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-xs font-black text-[#142e53] dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTimeShort(item.hora_entrada)}</span>
                      <span className="text-slate-400 dark:text-slate-500">→</span>
                      <span>{item.hora_saida ? formatTimeShort(item.hora_saida) : 'Agora'}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                      ⏱️ {duration}
                    </span>
                  </div>
                </div>

                {/* Observação do dia */}
                {item.observacao_dia && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/70 dark:bg-[#12243d] border border-blue-200/50 dark:border-[#1e3a63] text-[#142e53] dark:text-slate-200 text-xs flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{item.observacao_dia}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1b3356] flex items-center justify-end gap-2 text-xs">
                  {dog && (
                    <button
                      onClick={() => onEditCheckin(dog, item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#142e53] dark:hover:text-[#fffe42] hover:bg-slate-100 dark:hover:bg-[#12243d] font-semibold transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar Horário</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir o registro de presença de ${dogName}?`)) {
                        onDeleteCheckin(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Excluir check-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
