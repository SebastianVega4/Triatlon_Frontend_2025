import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';
import { Equipo } from '../interfaces/equipo';
import { Participante } from '../interfaces/participante';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${environment.apiUrl}/equipos`);
  }

  getAllEquipos(): Observable<Equipo[]> {
    // Obtener todos los participantes y extraer los equipos únicos
    return this.http.get<any[]>(`${environment.apiUrl}/participantes`).pipe(
      map(participantes => {
        // Extraer IDs únicos de equipos
        const equipoIds = [...new Set(participantes.map(p => p.equipo_id).filter(id => id))];
        return equipoIds;
      }),
      switchMap(equipoIds => {
        if (equipoIds.length === 0) {
          return of([]);
        }
        // Obtener cada equipo por su ID
        return combineLatest(
          equipoIds.map(id => 
            this.getEquipo(id).pipe(
              catchError(() => of(null))
            )
          )
        ).pipe(
          map(equipos => equipos.filter(e => e !== null) as Equipo[])
        );
      }),
      catchError(error => {
        console.error('Error al obtener todos los equipos:', error);
        return of([]);
      })
    );
  }

  getEquipo(id: string): Observable<Equipo> {
    return this.http.get<Equipo>(`${environment.apiUrl}/equipos/${id}`);
  }

  createEquipo(equipo: { nombre: string; documento_id: string }): Observable<Equipo> {
    return this.http.post<Equipo>(`${environment.apiUrl}/equipos`, equipo, {
      headers: this.getHeaders()
    });
  }

  updateEquipo(id: string, data: Partial<Equipo>): Observable<Equipo> {
    return this.http.put<Equipo>(`${environment.apiUrl}/equipos/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteEquipo(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/equipos/${id}`, {
      headers: this.getHeaders()
    });
  }

  getParticipantes(equipoId: string): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${environment.apiUrl}/equipos/${equipoId}/participantes`);
  }

  addParticipante(equipoId: string, participante: Omit<Participante, 'id'>): Observable<Participante> {
    return this.http.post<Participante>(
      `${environment.apiUrl}/equipos/${equipoId}/participantes`, 
      participante,
      { headers: this.getHeaders() }
    );
  }

  updateParticipante(equipoId: string, participanteId: string, data: Partial<Participante>): Observable<Participante> {
    return this.http.put<Participante>(
      `${environment.apiUrl}/equipos/${equipoId}/participantes/${participanteId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteParticipante(equipoId: string, participanteId: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/equipos/${equipoId}/participantes/${participanteId}`,
      { headers: this.getHeaders() }
    );
  }

  uploadArchivoEquipo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post(`${environment.apiUrl}/archivos/upload-file-pdf`, formData, {
      headers
    });
  }
}