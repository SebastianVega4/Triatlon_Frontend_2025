import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export interface Imagen {
    id?: string;
    url: string;
    nombre: string;
    descripcion: string;
    fecha_imagen: string;
    creado_en?: string;
}

export interface ImagenesResponse {
    success: boolean;
    total: number;
    data: Imagen[];
}

export interface ImagenResponse {
    success: boolean;
    data: Imagen;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ImagenesService {
    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    // Listar todas las imágenes
    getImagenes(): Observable<ImagenesResponse> {
        return this.http.get<ImagenesResponse>(`${environment.apiUrl}/imagenes/imagenes`);
    }

    // Obtener una imagen por ID
    getImagen(id: string): Observable<ImagenResponse> {
        return this.http.get<ImagenResponse>(`${environment.apiUrl}/imagenes/imagenes/${id}`);
    }

    // Crear una nueva imagen
    createImagen(formData: FormData): Observable<ImagenResponse> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.post<ImagenResponse>(
            `${environment.apiUrl}/imagenes/imagenes`,
            formData,
            { headers }
        );
    }

    // Actualizar una imagen
    updateImagen(id: string, data: Partial<Imagen>): Observable<ImagenResponse> {
        return this.http.put<ImagenResponse>(
            `${environment.apiUrl}/imagenes/imagenes/${id}`,
            data,
            { headers: this.getHeaders() }
        );
    }

    // Eliminar una imagen
    deleteImagen(id: string): Observable<any> {
        return this.http.delete(
            `${environment.apiUrl}/imagenes/imagenes/${id}`,
            { headers: this.getHeaders() }
        );
    }
}