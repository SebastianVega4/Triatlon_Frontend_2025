export interface Participante {
    id?: string;
    nombre: string;
    genero: 'masculino' | 'femenino'|null;
    seccional: 'Tunja' | 'Sogamoso' | 'Chiquinquirá' | 'Duitama' | 'Aguazul' | null;
    rol: 'estudiante' | 'funcionario' | null;
    delegado: boolean;
    disciplina: 'natacion' | 'ciclismo' | 'atletismo' | null;
    disciplina_ascun: 'natacion' | 'ciclismo' | 'atletismo' | 'ninguno' | null;
    telefono: string;
    correo: string;
    tiempo: string;
    premio_especial: boolean;
    penalizado: boolean;
    equipo_id: string | null;
  }
