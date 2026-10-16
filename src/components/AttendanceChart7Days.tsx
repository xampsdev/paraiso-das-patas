import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Flame, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { DailyAttendanceStat } from '../lib/dataService';

interface AttendanceChart7DaysProps {
  stats: DailyAttendanceStat[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyAttendanceStat }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#142e53] text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs z-50">
        <p className="font-extrabold text-[#fffe42] flex items-center gap-1">
          <span>{data.fullWeekday}</span>
          <span className="text-white/70 font-normal">({data.dayLabel})</span>
        </p>
        <p className="text-sm font-black text-white mt-0.5">
          {data.count} {data.count === 1 ? 'cão atendido' : 'cães atendidos'}
        </p>
        {data.isPeak && (
          <p className="text-[10px] text-amber-300 font-bold flex items-center gap-1 mt-1 pt-1 border-t border-white/10">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Dia de maior pico dos 7 dias!</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const AttendanceChart7Days: React.FC<AttendanceChart7DaysProps> = ({
  stats,
  selectedDate,
  onSelectDate,
  isLoading = false,
}) => {
  // Cálculos de métricas da semana
  const metrics = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { total: 0, average: '0', peakDay: null, maxCount: 0 };
    }

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const average = (total / stats.length).toFixed(1);

    let peak: DailyAttendanceStat | null = null;
    for (const item of stats) {
      if (!peak || item.count > peak.count) {
        peak = item;
      }
    }

    const peakDay: DailyAttendanceStat | null = peak && peak.count > 0 ? peak : null;
    const maxCount = peak ? peak.count : 0;

    return {
      total,
      average,
      peakDay,
      maxCount,
    };
  }, [stats]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#142e53] text-[#fffe42] flex items-center justify-center font-black">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#142e53] flex items-center gap-1.5 leading-tight">
              <span>Frequência dos Últimos 7 Dias</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Toque em uma barra para carregar as presenças do dia
            </p>
          </div>
        </div>

        {/* Peak Badge */}
        {metrics.peakDay && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 animate-bounce" />
            <span>
              Maior movimento:{' '}
              <strong className="text-[#142e53]">
                {metrics.peakDay.weekday} ({metrics.peakDay.count} cães)
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between px-1">
          <span className="text-slate-500 font-medium">Total da semana:</span>
          <span className="font-black text-[#142e53] text-sm">{metrics.total} cães</span>
        </div>
        <div className="flex items-center justify-between px-1 border-l border-slate-200">
          <span className="text-slate-500 font-medium">Média diária:</span>
          <span className="font-black text-[#142e53] text-sm">{metrics.average} / dia</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-48 sm:h-52 pt-2">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            Carregando gráfico...
          </div>
        ) : stats.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            Sem dados nos últimos 7 dias.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats}
              margin={{ top: 12, right: 10, left: -22, bottom: 0 }}
              onClick={(e: unknown) => {
                const chartEvent = e as { activePayload?: Array<{ payload?: { date?: string } }> };
                if (chartEvent?.activePayload && chartEvent.activePayload.length) {
                  const clickedDate = chartEvent.activePayload[0]?.payload?.date;
                  if (clickedDate) {
                    onSelectDate(clickedDate);
                  }
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="weekday"
                axisLine={false}
                tickLine={false}
                tick={(props: any) => {
                  const { x, y, payload } = props;
                  const item = stats[payload?.index];
                  const isCurrentSelected = item?.date === selectedDate;
                  const isPeak = item?.isPeak;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="middle"
                        fill={isCurrentSelected ? '#142e53' : isPeak ? '#d97706' : '#64748b'}
                        fontSize={11}
                        fontWeight={isCurrentSelected || isPeak ? 800 : 500}
                      >
                        {item?.weekday}
                      </text>
                      <text
                        x={0}
                        y={0}
                        dy={24}
                        textAnchor="middle"
                        fill={isCurrentSelected ? '#142e53' : '#94a3b8'}
                        fontSize={9}
                        fontWeight={isCurrentSelected ? 700 : 400}
                      >
                        {item?.dayLabel}
                      </text>
                    </g>
                  );
                }}
                height={35}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                domain={[0, (dataMax: number) => Math.max(dataMax + 1, 4)]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20, 46, 83, 0.04)' }} />
              <Bar dataKey="count" radius={[8, 8, 2, 2]}>
                {stats.map((entry) => {
                  const isSelected = entry.date === selectedDate;
                  const isPeak = entry.isPeak;

                  // Cores:
                  // Selecionado -> Amarelo vibrante #fffe42 com contorno navy
                  // Pico -> Âmbar dourado #f59e0b
                  // Normal -> Azul marinho da marca #142e53
                  let fill = '#142e53';
                  let stroke = 'transparent';
                  let strokeWidth = 0;

                  if (isSelected) {
                    fill = '#fffe42';
                    stroke = '#142e53';
                    strokeWidth = 2.5;
                  } else if (isPeak) {
                    fill = '#0284c7'; // Azul royal destacado para maior clareza ou navy
                  }

                  return (
                    <Cell
                      key={`cell-${entry.date}`}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-200 hover:opacity-85"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend / Tip */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#142e53]" />
            <span>Dias normais</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7]" />
            <span>Dia de pico</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#fffe42] border border-[#142e53]" />
            <span>Dia selecionado</span>
          </span>
        </div>

        <span className="text-[10px] text-slate-400 font-medium">
          Atualizado em tempo real
        </span>
      </div>
    </div>
  );
};
