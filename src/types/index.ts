export interface Dog {
  id: string;
  nome: string;
  tutor_nome: string;
  telefone: string;
  observacoes: string | null;
  ativo: boolean;
  created_at?: string;
}

export interface Checkin {
  id: string;
  dog_id: string;
  data: string; // Formato YYYY-MM-DD
  hora_entrada: string; // Formato HH:mm:ss ou HH:mm
  hora_saida: string | null; // Formato HH:mm:ss ou HH:mm ou null
  observacao_dia: string | null;
  created_at?: string;
  dog?: Dog; // Relação opcional
}

export type AttendanceStatus = 'ausente' | 'no_espaco' | 'concluido';

export interface DogWithStatus {
  dog: Dog;
  checkin?: Checkin | null;
  status: AttendanceStatus;
  duration?: string; // Ex: '3h 15m'
}

export type FilterTab = 'todos' | 'no_espaco' | 'concluidos' | 'ausentes';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
