import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root'
})
export class CorreoService {
    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    enviarCorreoAprobado(correo: string, mensaje: string = ''): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post(`${environment.apiUrl}/correos/aprobado`,
            { correo, mensaje },
            { headers }
        ).pipe(
            timeout(10000) // Timeout de 10 segundos
        );
    }

    enviarCorreoRechazado(correo: string, mensaje: string = ''): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.post(`${environment.apiUrl}/correos/rechazado`,
            { correo, mensaje },
            { headers }
        ).pipe(
            timeout(10000) // Timeout de 10 segundos
        );
    }
}
