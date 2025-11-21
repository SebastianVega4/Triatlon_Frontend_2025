import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';
import { EquiposService } from './equipos';
import { Equipo } from '../interfaces/equipo';
import { Participante } from '../interfaces/participante';
import { Premio } from '../interfaces/premio';

export interface VisibilidadResultados {
  resultados_visibles: boolean;
}

export interface PodioResponse {
  podio: Equipo[];
  otros: Equipo[];
}

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private equiposService: EquiposService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getVisibilidad(): Observable<VisibilidadResultados> {
    return this.http.get<VisibilidadResultados>(`${environment.apiUrl}/resultados/visibilidad`);
  }

  getVisibilidadResultados(): Observable<boolean> {
    return this.getVisibilidad().pipe(map((response) => response.resultados_visibles));
  }

  toggleVisibilidad(visibilidad: boolean): Observable<VisibilidadResultados> {
    return this.http.put<VisibilidadResultados>(
      `${environment.apiUrl}/resultados/visibilidad`,
      { resultados_visibles: visibilidad },
      { headers: this.getHeaders() }
    );
  }

  toggleVisibilidadResultados(visible: boolean): Observable<VisibilidadResultados> {
    return this.toggleVisibilidad(visible);
  }

  getPodio(): Observable<PodioResponse> {
    return this.http.get<PodioResponse>(`${environment.apiUrl}/resultados/podio`);
  }

  getResultadosDisciplina(disciplina: string): Observable<Participante[]> {
    return this.http.get<Participante[]>(
      `${environment.apiUrl}/resultados/disciplina/${disciplina}`
    );
  }

  getResultadosPorDisciplina(
    disciplina: string
  ): Observable<Array<Participante & { equipo_nombre?: string }>> {
    return this.getResultadosDisciplina(disciplina).pipe(
      switchMap((participantes: Participante[]) => {
        if (participantes.length === 0) {
          return of([]);
        }

        // Obtener nombres de equipos para cada participante
        return combineLatest(
          participantes.map((p) => {
            if (!p.equipo_id) {
              return of({
                ...p,
                equipo_nombre: 'Sin equipo',
              });
            }
            return this.equiposService.getEquipo(p.equipo_id).pipe(
              map((equipo) => ({
                ...p,
                equipo_nombre: equipo?.nombre || 'Sin equipo',
              })),
              catchError(() =>
                of({
                  ...p,
                  equipo_nombre: 'Error cargando equipo',
                })
              )
            );
          })
        );
      }),
      map((participantes: (Participante & { equipo_nombre?: string })[]) =>
        participantes.sort((a, b) =>
          this.compararTiempos(a.tiempo || '99:59:59', b.tiempo || '99:59:59')
        )
      ),
      catchError((error) => {
        console.error('Error al obtener resultados por disciplina:', error);
        return of([]);
      })
    );
  }

  aplicarPenalizacion(participanteId: string, disciplina: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/resultados/penalizacion`,
      { participante_id: participanteId, disciplina },
      { headers: this.getHeaders() }
    );
  }

  calcularTiempoTotal(equipoId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/resultados/calcular-tiempo`,
      { equipo_id: equipoId },
      { headers: this.getHeaders() }
    );
  }

  actualizarPosiciones(): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/resultados/actualizar-posiciones`,
      {},
      { headers: this.getHeaders() }
    );
  }

  calcularPremios(): Observable<{ message: string; premios: Premio[] }> {
    return this.http.post<{ message: string; premios: Premio[] }>(
      `${environment.apiUrl}/resultados/calcular-premios`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getPremios(): Observable<Premio[]> {
    return this.http.get<Premio[]>(`${environment.apiUrl}/premios`);
  }

  getPremiosIndividuales(): Observable<Premio[]> {
    return this.getPremios().pipe(
      map((premios) => {
        console.log('Premios obtenidos:', premios);
        return premios || [];
      }),
      catchError((err) => {
        console.error('Error al obtener premios:', err);
        return of([]);
      })
    );
  }

  setPremioEspecial(participanteId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/resultados/premio-especial`,
      { participante_id: participanteId },
      { headers: this.getHeaders() }
    );
  }

  compararTiempos(tiempoA: string, tiempoB: string): number {
    const parseTime = (time: string) => {
      if (!time || time === '00:00:00' || time === '00:00:00.000') return Infinity;

      const [hms, ms] = time.split('.');
      const [hh, mm, ss] = hms.split(':').map(Number);
      const milliseconds = ms ? Number(ms) : 0;
      return (hh * 3600 + mm * 60 + ss) * 1000 + milliseconds;
    };

    return parseTime(tiempoA) - parseTime(tiempoB);
  }
}
