import Dexie, { type Table } from 'dexie';

export interface ExerciciosRealizados {
  nome: string;
  series: number;
  repeticoes: number;
  observacao: string;
  hora_realizacao?: string; // Horário de realização (HH:MM)
}

export interface Treino {
  id?: number;
  data: string; // YYYY-MM-DD
  hora_inicio: string;
  hora_fim?: string;
  exercicios_realizados: ExerciciosRealizados[];
}

export interface ExercicioPlano {
  nome: string;
  series: number;
  repeticoes: number;
}

export interface DiaPlano {
  dia_semana: string;
  exercicios: ExercicioPlano[];
}

export interface PlanoAtivo {
  id?: number;
  nome: string;
  nivel: string;
  criado_em: string;
  dias: DiaPlano[];
}

export class CalisBotDatabase extends Dexie {
  historico_treinos!: Table<Treino>;
  plano_ativo!: Table<PlanoAtivo>;

  constructor() {
    super('CalisBotDatabase');
    this.version(1).stores({
      historico_treinos: '++id, data',
      plano_ativo: '++id',
    });
  }
}

export const db = new CalisBotDatabase();
export type { Table };
