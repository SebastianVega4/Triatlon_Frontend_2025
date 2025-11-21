import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Noticia {
    id?: string;
    titulo: string;
    resumen: string;
    categoria: string;
    fecha: string;
    contenido: string;
    imagen?: {
        id: string;
        url: string;
        nombre: string;
        descripcion?: string;
        fecha_imagen?: string;
    };
    visible?: boolean;
    created_at?: string;
}

export interface NoticiasResponse {
    success: boolean;
    total: number;
    data: Noticia[];
}

export interface NoticiaResponse {
    success: boolean;
    data: Noticia;
}

@Injectable({
    providedIn: 'root'
})
export class NoticiasService {
    private apiUrl = `${environment.apiUrl}/noticias`;

    constructor(private http: HttpClient) { }

    // Obtener todas las noticias visibles
    listarNoticias(): Observable<NoticiasResponse> {
        return this.http.get<NoticiasResponse>(this.apiUrl);
    }

    // Obtener una noticia por ID
    obtenerNoticia(id: string): Observable<NoticiaResponse> {
        return this.http.get<NoticiaResponse>(`${this.apiUrl}/${id}`);
    }

    // Crear una noticia (admin)
    crearNoticia(noticia: FormData): Observable<NoticiaResponse> {
        return this.http.post<NoticiaResponse>(this.apiUrl, noticia);
    }

    // Actualizar una noticia (admin)
    actualizarNoticia(id: string, noticia: Partial<Noticia>): Observable<NoticiaResponse> {
        return this.http.put<NoticiaResponse>(`${this.apiUrl}/${id}`, noticia);
    }

    // Eliminar una noticia (admin)
    eliminarNoticia(id: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
    }
}
