export interface Equipo {
    id?: string;
    nombre: string;
    penalizacion: boolean;
    penalizacion_natacion: boolean;
    penalizacion_ciclismo: boolean;
    penalizacion_atletismo: boolean;
    tiempo_total: string;
    posicion: number;
    visible: boolean;
    created_at: string;
    documento_id: string;
  }