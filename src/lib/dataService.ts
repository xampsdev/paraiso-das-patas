import { Dog, Checkin } from '../types';
import { getSupabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_DOGS = 'creche_local_dogs_v1';
const LOCAL_STORAGE_CHECKINS = 'creche_local_checkins_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatTimeShort(timeString: string | null | undefined): string {
  if (!timeString) return '--:--';
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
}

export function calculateDuration(horaEntrada: string, horaSaida: string | null): string {
  if (!horaEntrada) return '';

  const parseToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const startMin = parseToMinutes(horaEntrada);
  const endMin = horaSaida ? parseToMinutes(horaSaida) : parseToMinutes(getCurrentTimeString());

  let diff = endMin - startMin;
  if (diff < 0) diff += 24 * 60; // Caso vire a noite

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Initial realistic demo data for local mode
function getInitialDogs(): Dog[] {
  return [
    {
      id: 'd1-thor-golden',
      nome: 'Thor',
      tutor_nome: 'Carlos Silva',
      telefone: '(11) 98765-4321',
      observacoes: 'Alérgico a frango. Adora brincar com água e piscina.',
      ativo: true,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'd2-mel-spitz',
      nome: 'Mel',
      tutor_nome: 'Fernanda Lima',
      telefone: '(11) 99123-4567',
      observacoes: 'Toma medicamento protetor gástrico às 14h. Muito sociável.',
      ativo: true,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'd3-pipoca-beagle',
      nome: 'Pipoca',
      tutor_nome: 'Roberto Rocha',
      telefone: '(11) 97788-9900',
      observacoes: 'Cheio de energia! Cuidado ao abrir o portão externo.',
      ativo: true,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'd4-bob-frenchie',
      nome: 'Bob',
      tutor_nome: 'Amanda Souza',
      telefone: '(11) 96543-2109',
      observacoes: 'Sensível a calor excessivo. Manter na sala climatizada.',
      ativo: true,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'd5-luna-border',
      nome: 'Luna',
      tutor_nome: 'Marcelo Dias',
      telefone: '(11) 98111-2233',
      observacoes: 'Extremamente inteligente, fã de bolinhas de tênis.',
      ativo: true,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'd6-amora-shihtzu',
      nome: 'Amora',
      tutor_nome: 'Patrícia Alves',
      telefone: '(11) 99444-5566',
      observacoes: 'Tímida nos primeiros minutos. Gosta de carinho na orelha.',
      ativo: true,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
}

function getInitialCheckins(): Checkin[] {
  const checkins: Checkin[] = [];
  const dogIds = [
    'd1-thor-golden',
    'd2-mel-spitz',
    'd3-pipoca-beagle',
    'd4-bob-frenchie',
    'd5-luna-border',
    'd6-amora-shihtzu',
  ];

  // Distribuir presenças dinâmicas nos últimos 7 dias (garante dados ricos em qualquer data)
  const pattern = [
    [0, 1, 2, 3],          // Hoje: 4 cães
    [0, 1, 2, 4, 5],       // Ontem: 5 cães
    [0, 1, 2, 3, 4, 5],    // -2 dias: 6 cães (Pico da semana)
    [0, 2, 4],             // -3 dias: 3 cães
    [1, 2, 3, 4, 5],       // -4 dias: 5 cães
    [0, 1, 3, 5],          // -5 dias: 4 cães
    [2, 4],                // -6 dias: 2 cães
  ];

  const now = new Date();
  pattern.forEach((indices, dayOffset) => {
    const d = new Date(now.getTime() - dayOffset * 86400000);
    const dateStr = d.toISOString().split('T')[0];

    indices.forEach((idx, i) => {
      const dogId = dogIds[idx];
      const isToday = dayOffset === 0;
      const isCheckedOut = !isToday || i === 3;

      checkins.push({
        id: `c-seed-${dayOffset}-${idx}`,
        dog_id: dogId,
        data: dateStr,
        hora_entrada: `0${7 + (i % 3)}:${15 * (i % 4)}:00`,
        hora_saida: isCheckedOut ? `1${6 + (i % 3)}:${10 * (i % 6)}:00` : null,
        observacao_dia:
          i === 0
            ? 'Dia excelente, muito brincalhão e almoçou bem.'
            : i === 1
            ? 'Tomou medicamento e descansou no horário.'
            : null,
        created_at: d.toISOString(),
      });
    });
  });

  return checkins;
}

// Local Storage helpers
function getLocalDogs(): Dog[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_STORAGE_DOGS);
  if (!raw) {
    const initial = getInitialDogs();
    localStorage.setItem(LOCAL_STORAGE_DOGS, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return getInitialDogs();
  }
}

function saveLocalDogs(dogs: Dog[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_DOGS, JSON.stringify(dogs));
  }
}

function getLocalCheckins(): Checkin[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_STORAGE_CHECKINS);
  if (!raw) {
    const initial = getInitialCheckins();
    localStorage.setItem(LOCAL_STORAGE_CHECKINS, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return getInitialCheckins();
  }
}

function saveLocalCheckins(checkins: Checkin[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_CHECKINS, JSON.stringify(checkins));
  }
}

// ==========================================
// DATA SERVICE API
// ==========================================

export async function fetchAllDogs(): Promise<Dog[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      if (data) return data as Dog[];
    } catch (err) {
      console.warn('Erro ao buscar cães do Supabase, usando local:', err);
    }
  }

  // Fallback to local
  const dogs = getLocalDogs();
  return dogs.sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function createDog(dogData: Omit<Dog, 'id' | 'created_at'>): Promise<Dog> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .insert([dogData])
        .select()
        .single();

      if (error) throw error;
      if (data) return data as Dog;
    } catch (err) {
      console.warn('Erro ao criar cão no Supabase, salvando local:', err);
    }
  }

  // Fallback local
  const newDog: Dog = {
    ...dogData,
    id: 'local_' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const current = getLocalDogs();
  current.unshift(newDog);
  saveLocalDogs(current);
  return newDog;
}

export async function updateDog(id: string, updates: Partial<Dog>): Promise<Dog> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) return data as Dog;
    } catch (err) {
      console.warn('Erro ao atualizar cão no Supabase, salvando local:', err);
    }
  }

  const current = getLocalDogs();
  const index = current.findIndex((d) => d.id === id);
  if (index >= 0) {
    current[index] = { ...current[index], ...updates };
    saveLocalDogs(current);
    return current[index];
  }
  throw new Error('Cão não encontrado');
}

export async function deleteDog(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('dogs').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Erro ao deletar cão no Supabase:', err);
    }
  }

  const current = getLocalDogs();
  const filtered = current.filter((d) => d.id !== id);
  saveLocalDogs(filtered);

  // Também limpa checkins associados localmente
  const checkins = getLocalCheckins().filter((c) => c.dog_id !== id);
  saveLocalCheckins(checkins);

  return true;
}

export async function fetchCheckinsByDate(dateStr: string): Promise<Checkin[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('*, dog:dogs(*)')
        .eq('data', dateStr)
        .order('hora_entrada', { ascending: false });

      if (error) throw error;
      if (data) return data as Checkin[];
    } catch (err) {
      console.warn('Erro ao buscar checkins do Supabase, usando local:', err);
    }
  }

  // Fallback local
  const checkins = getLocalCheckins();
  const dogs = getLocalDogs();
  const dogMap = new Map(dogs.map((d) => [d.id, d]));

  const filtered = checkins
    .filter((c) => c.data === dateStr)
    .map((c) => ({
      ...c,
      dog: dogMap.get(c.dog_id),
    }));

  return filtered.sort((a, b) => b.hora_entrada.localeCompare(a.hora_entrada));
}

export async function createCheckin(
  dogId: string,
  dataDate?: string,
  horaEntrada?: string,
  observacaoDia?: string
): Promise<Checkin> {
  const date = dataDate || getTodayDateString();
  const time = horaEntrada || getCurrentTimeString();

  const payload = {
    dog_id: dogId,
    data: date,
    hora_entrada: time,
    hora_saida: null,
    observacao_dia: observacaoDia || null,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .insert([payload])
        .select('*, dog:dogs(*)')
        .single();

      if (error) throw error;
      if (data) return data as Checkin;
    } catch (err) {
      console.warn('Erro ao criar checkin no Supabase, salvando local:', err);
    }
  }

  // Local fallback
  const dogs = getLocalDogs();
  const dog = dogs.find((d) => d.id === dogId);
  const newCheckin: Checkin = {
    id: 'chk_' + Math.random().toString(36).substring(2, 9),
    ...payload,
    dog,
    created_at: new Date().toISOString(),
  };

  const current = getLocalCheckins();
  current.unshift(newCheckin);
  saveLocalCheckins(current);
  return newCheckin;
}

export async function performCheckout(
  checkinId: string,
  horaSaida?: string,
  observacaoDia?: string
): Promise<Checkin> {
  const time = horaSaida || getCurrentTimeString();

  const supabase = getSupabase();
  if (supabase) {
    try {
      const updateData: { hora_saida: string; observacao_dia?: string } = {
        hora_saida: time,
      };
      if (observacaoDia !== undefined) {
        updateData.observacao_dia = observacaoDia;
      }

      const { data, error } = await supabase
        .from('checkins')
        .update(updateData)
        .eq('id', checkinId)
        .select('*, dog:dogs(*)')
        .single();

      if (error) throw error;
      if (data) return data as Checkin;
    } catch (err) {
      console.warn('Erro ao realizar checkout no Supabase, atualizando local:', err);
    }
  }

  // Local fallback
  const current = getLocalCheckins();
  const index = current.findIndex((c) => c.id === checkinId);
  if (index >= 0) {
    current[index] = {
      ...current[index],
      hora_saida: time,
      observacao_dia: observacaoDia !== undefined ? observacaoDia : current[index].observacao_dia,
    };
    saveLocalCheckins(current);
    const dogs = getLocalDogs();
    current[index].dog = dogs.find((d) => d.id === current[index].dog_id);
    return current[index];
  }

  throw new Error('Checkin não encontrado');
}

export async function updateCheckin(
  checkinId: string,
  updates: Partial<Checkin>
): Promise<Checkin> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .update(updates)
        .eq('id', checkinId)
        .select('*, dog:dogs(*)')
        .single();

      if (error) throw error;
      if (data) return data as Checkin;
    } catch (err) {
      console.warn('Erro ao atualizar checkin no Supabase:', err);
    }
  }

  const current = getLocalCheckins();
  const index = current.findIndex((c) => c.id === checkinId);
  if (index >= 0) {
    current[index] = { ...current[index], ...updates };
    saveLocalCheckins(current);
    const dogs = getLocalDogs();
    current[index].dog = dogs.find((d) => d.id === current[index].dog_id);
    return current[index];
  }
  throw new Error('Checkin não encontrado');
}

export async function deleteCheckin(checkinId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('checkins').delete().eq('id', checkinId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Erro ao deletar checkin no Supabase:', err);
    }
  }

  const current = getLocalCheckins();
  const filtered = current.filter((c) => c.id !== checkinId);
  saveLocalCheckins(filtered);
  return true;
}

export async function syncLocalToSupabase(): Promise<{ dogsCount: number; checkinsCount: number }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase não está configurado.');

  const localDogs = getLocalDogs();
  const localCheckins = getLocalCheckins();

  let dogsAdded = 0;
  let checkinsAdded = 0;

  // Insert dogs
  for (const dog of localDogs) {
    const { id, created_at, ...cleanDog } = dog;
    const { data, error } = await supabase
      .from('dogs')
      .insert([cleanDog])
      .select()
      .single();

    if (!error && data) {
      dogsAdded++;
      // Sync checkins for this dog
      const dogCheckins = localCheckins.filter((c) => c.dog_id === id);
      for (const chk of dogCheckins) {
        const { id: chkId, created_at: chkCreated, dog: _dog, ...cleanChk } = chk;
        await supabase.from('checkins').insert([{ ...cleanChk, dog_id: data.id }]);
        checkinsAdded++;
      }
    }
  }

    return { dogsCount: dogsAdded, checkinsCount: checkinsAdded };
}

export interface DailyAttendanceStat {
  date: string;
  dayLabel: string;
  weekday: string;
  fullWeekday: string;
  count: number;
  isPeak: boolean;
  isToday: boolean;
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_FULL = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export async function fetchLast7DaysAttendance(
  referenceDateStr?: string
): Promise<DailyAttendanceStat[]> {
  const ref = referenceDateStr ? new Date(`${referenceDateStr}T12:00:00`) : new Date();
  const todayStr = getTodayDateString();

  // Gerar os últimos 7 dias em ordem cronológica (d-6 até d)
  const dateList: { dateStr: string; dateObj: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(ref.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    dateList.push({ dateStr, dateObj: d });
  }

  const startDateStr = dateList[0].dateStr;
  const endDateStr = dateList[dateList.length - 1].dateStr;

  const countMap = new Map<string, number>();
  dateList.forEach((d) => countMap.set(d.dateStr, 0));

  const supabase = getSupabase();
  let fetchedFromSupabase = false;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('id, dog_id, data')
        .gte('data', startDateStr)
        .lte('data', endDateStr);

      if (!error && data) {
        fetchedFromSupabase = true;
        // Conta cães por dia
        data.forEach((chk: { data: string }) => {
          if (countMap.has(chk.data)) {
            countMap.set(chk.data, (countMap.get(chk.data) || 0) + 1);
          }
        });
      }
    } catch (err) {
      console.warn('Erro ao buscar histórico de 7 dias no Supabase, usando local:', err);
    }
  }

  if (!fetchedFromSupabase) {
    const local = getLocalCheckins();
    local.forEach((chk) => {
      if (countMap.has(chk.data)) {
        countMap.set(chk.data, (countMap.get(chk.data) || 0) + 1);
      }
    });
  }

  // Descobrir maior contagem para destacar o dia de maior pico
  let maxCount = 0;
  countMap.forEach((cnt) => {
    if (cnt > maxCount) maxCount = cnt;
  });

  return dateList.map(({ dateStr, dateObj }) => {
    const count = countMap.get(dateStr) || 0;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayOfWeekIdx = dateObj.getDay();

    return {
      date: dateStr,
      dayLabel: `${day}/${month}`,
      weekday: WEEKDAY_SHORT[dayOfWeekIdx],
      fullWeekday: WEEKDAY_FULL[dayOfWeekIdx],
      count,
      isPeak: maxCount > 0 && count === maxCount,
      isToday: dateStr === todayStr,
    };
  });
}
