import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Participante } from '../interfaces/participante';
import { EquiposService } from './equipos';

@Injectable({
  providedIn: 'root',
})
export class ParticipantesService {
  constructor(private http: HttpClient, private equiposService: EquiposService) {}

  getParticipantesConEquipos(): Observable<(Participante & { equipoNombre: string })[]> {
    return this.getAllParticipantes().pipe(
      switchMap((participantes) => {
        if (participantes.length === 0) {
          return of([]);
        }

        return combineLatest(
          participantes.map((p) => {
            if (!p.equipo_id) {
              return of({
                ...p,
                equipoNombre: 'Sin equipo',
              });
            }
            return this.equiposService.getEquipo(p.equipo_id).pipe(
              map((equipo) => {
                // Solo incluir si el equipo está aprobado (visible = true)
                if (equipo && equipo.visible) {
                  return {
                    ...p,
                    equipoNombre: equipo.nombre || 'Sin equipo',
                  };
                }
                return null; // Excluir participantes de equipos no aprobados
              }),
              catchError(() => of(null))
            );
          })
        );
      }),
      map((participantes) => 
        participantes
          .filter(p => p !== null) // Filtrar participantes de equipos no aprobados
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
      ),
      catchError((error) => {
        console.error('Error al obtener participantes:', error);
        return of([]);
      })
    );
  }

  getAllParticipantes(): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${environment.apiUrl}/participantes`);
  }

  getParticipante(id: string): Observable<Participante> {
    return this.http.get<Participante>(`${environment.apiUrl}/participantes/${id}`);
  }

  crearParticipante(participante: Omit<Participante, 'id'>): Observable<Participante> {
    return this.http.post<Participante>(`${environment.apiUrl}/participantes`, participante);
  }

  actualizarParticipante(
    id: string,
    participante: Partial<Participante>
  ): Observable<Participante> {
    return this.http.put<Participante>(`${environment.apiUrl}/participantes/${id}`, participante);
  }

  eliminarParticipante(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/participantes/${id}`);
  }

  getParticipantesPorDisciplina(disciplina: string): Observable<Participante[]> {
    return this.http.get<Participante[]>(
      `${environment.apiUrl}/participantes?disciplina=${disciplina}`
    );
  }

  getParticipantesPorGenero(genero: string): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${environment.apiUrl}/participantes?genero=${genero}`);
  }
}
