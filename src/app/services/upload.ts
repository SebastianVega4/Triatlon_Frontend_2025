import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Upload {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la URL de visualización de un archivo de Google Drive
   * @param fileId ID del archivo en Google Drive
   * @returns URL para visualizar el archivo
   */
  getFileViewUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * Obtiene la URL de descarga directa de un archivo de Google Drive
   * @param fileId ID del archivo en Google Drive
   * @returns URL para descargar el archivo
   */
  getFileDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  /**
   * Sube un archivo al servidor
   * @param file Archivo a subir
   * @param endpoint Endpoint específico (upload-file, upload-file-pdf, upload-file-noticias)
   * @returns Observable con la respuesta del servidor
   */
  uploadFile(file: File, endpoint: string = 'upload-file'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/archivo/${endpoint}`, formData);
  }

  /**
   * Elimina un archivo del servidor
   * @param fileId ID del archivo a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteFile(fileId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/archivo/${fileId}`);
  }
}
