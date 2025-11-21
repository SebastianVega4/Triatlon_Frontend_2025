import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiasService, Noticia } from '../../services/noticias';
import { firstValueFrom } from 'rxjs';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-gestion-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './gestion-noticias.html',
  styleUrls: ['./gestion-noticias.scss']
})
export class GestionNoticias implements OnInit {
  loading = false;
  loadingNoticias = true;
  
  titulo = '';
  resumen = '';
  categoria = '';
  fecha = '';
  contenido = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  successMessage = '';
  errorMessage = '';
  
  noticias: Noticia[] = [];
  categorias = ['evento', 'inscripciones', 'resultados', 'general', 'entrenamiento', 'seguridad', 'premios'];
  
  // Configuración del editor Quill
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ]
  };
  
  showDeleteModal = false;
  noticiaToDelete: Noticia | null = null;
  
  showEditModal = false;
  noticiaToEdit: Noticia | null = null;
  editTitulo = '';
  editResumen = '';
  editCategoria = '';
  editFecha = '';
  editContenido = '';

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit(): void {
    this.loadNoticias();
    const today = new Date().toISOString().split('T')[0];
    this.fecha = today;
  }

  loadNoticias(): void {
    this.loadingNoticias = true;
    this.noticiasService.listarNoticias().subscribe({
      next: (response) => {
        if (response.success) {
          this.noticias = response.data;
        }
        this.loadingNoticias = false;
      },
      error: () => {
        this.loadingNoticias = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(this.selectedFile.type)) {
        this.errorMessage = 'Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, WEBP)';
        this.selectedFile = null;
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (this.selectedFile.size > maxSize) {
        this.errorMessage = 'El archivo es demasiado grande. Tamaño máximo: 10MB';
        this.selectedFile = null;
        return;
      }
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
      
      this.errorMessage = '';
    }
  }

  removePreview(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    
    // Limpiar input file
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.titulo || !this.resumen || !this.categoria || !this.fecha || !this.contenido || !this.selectedFile) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formData = new FormData();
      formData.append('titulo', this.titulo);
      formData.append('resumen', this.resumen);
      formData.append('categoria', this.categoria);
      formData.append('fecha', this.fecha);
      formData.append('contenido', this.contenido);
      formData.append('file', this.selectedFile);

      const response = await firstValueFrom(this.noticiasService.crearNoticia(formData));
      
      if (response.success) {
        this.clearForm();
        this.loadNoticias();
        this.successMessage = 'Noticia creada exitosamente';
        this.autoCloseToast();
      }
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al crear la noticia';
      this.autoCloseToast();
    } finally {
      this.loading = false;
    }
  }

  clearForm(): void {
    this.titulo = '';
    this.resumen = '';
    this.categoria = '';
    this.contenido = '';
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = '';
    const today = new Date().toISOString().split('T')[0];
    this.fecha = today;
    
    // Limpiar input file
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  confirmDelete(noticia: Noticia): void {
    this.noticiaToDelete = noticia;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.noticiaToDelete = null;
  }

  async deleteNoticia(): Promise<void> {
    if (!this.noticiaToDelete?.id) return;

    this.loading = true;
    try {
      await firstValueFrom(this.noticiasService.eliminarNoticia(this.noticiaToDelete.id));
      this.successMessage = 'Noticia eliminada exitosamente';
      this.loadNoticias();
      this.cancelDelete();
      this.autoCloseToast();
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al eliminar la noticia';
      this.autoCloseToast();
    } finally {
      this.loading = false;
    }
  }

  autoCloseToast(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  openEditModal(noticia: Noticia): void {
    this.noticiaToEdit = noticia;
    this.editTitulo = noticia.titulo;
    this.editResumen = noticia.resumen;
    this.editCategoria = noticia.categoria;
    this.editFecha = noticia.fecha.split('T')[0];
    this.editContenido = noticia.contenido;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.noticiaToEdit = null;
  }

  async saveEdit(): Promise<void> {
    if (!this.noticiaToEdit?.id) return;

    this.loading = true;
    try {
      const data = {
        titulo: this.editTitulo,
        resumen: this.editResumen,
        categoria: this.editCategoria,
        fecha: this.editFecha,
        contenido: this.editContenido
      };

      await firstValueFrom(this.noticiasService.actualizarNoticia(this.noticiaToEdit.id, data));
      this.successMessage = 'Noticia actualizada exitosamente';
      this.loadNoticias();
      this.closeEditModal();
      this.autoCloseToast();
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al actualizar la noticia';
      this.autoCloseToast();
    } finally {
      this.loading = false;
    }
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getImageUrl(noticia: Noticia): string {
    const url = noticia.imagen?.url;
    if (!url) {
      return '';
    }
    return this.convertGoogleDriveUrl(url);
  }

  convertGoogleDriveUrl(url: string): string {
    if (!url) return '';
    
    // Extraer el file ID de la URL
    const fileIdMatch = url.match(/id=([^&]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Usar el formato de thumbnail de Google Drive que funciona mejor
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    
    // Si no se puede extraer el ID, devolver la URL original
    return url;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  capitalizeCategory(categoria: string): string {
    return categoria.charAt(0).toUpperCase() + categoria.slice(1);
  }
}
