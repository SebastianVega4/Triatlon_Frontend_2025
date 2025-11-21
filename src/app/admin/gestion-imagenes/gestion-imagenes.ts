import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagenesService, Imagen } from '../../services/imagenes';
import { NoticiasService } from '../../services/noticias';
import { Loading } from '../../components/loading/loading';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-gestion-imagenes',
  standalone: true,
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './gestion-imagenes.html',
  styleUrls: ['./gestion-imagenes.scss']
})
export class GestionImagenes implements OnInit {
  // Estado de carga
  loading = false;
  loadingImagenes = true;
  
  // Formulario de subida
  nombre = '';
  descripcion = '';
  fechaImagen = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  // Mensajes
  successMessage = '';
  errorMessage = '';
  
  // Lista de imágenes
  imagenes: Imagen[] = [];
  
  // Modal de confirmación de eliminación
  showDeleteModal = false;
  imagenToDelete: Imagen | null = null;

  // Modal de edición
  showEditModal = false;
  imagenToEdit: Imagen | null = null;
  editNombre = '';
  editDescripcion = '';
  editFechaImagen = '';

  constructor(
    private imagenesService: ImagenesService,
    private noticiasService: NoticiasService
  ) {}

  ngOnInit(): void {
    this.loadImagenes();
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    this.fechaImagen = today;
  }

  async loadImagenes(): Promise<void> {
    this.loadingImagenes = true;
    
    try {
      const imagenesNoticiasIds = await this.getImagenesDeNoticias();
      const response = await firstValueFrom(this.imagenesService.getImagenes());
      
      if (response.success) {
        const imagenesGaleria = response.data.filter(img => {
          return !imagenesNoticiasIds.includes(img.id || '');
        });
        
        // Convertir las URLs de Google Drive para que funcionen
        this.imagenes = imagenesGaleria.map(img => ({
          ...img,
          url: this.convertGoogleDriveUrl(img.url)
        }));
      }
      this.loadingImagenes = false;
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      this.loadingImagenes = false;
    }
  }

  async getImagenesDeNoticias(): Promise<string[]> {
    try {
      const response = await firstValueFrom(this.noticiasService.listarNoticias());
      if (response.success) {
        // Extraer los IDs de las imágenes de todas las noticias
        const imagenesIds = response.data
          .filter(noticia => noticia.imagen && noticia.imagen.id)
          .map(noticia => noticia.imagen!.id);
        return imagenesIds;
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo imágenes de noticias:', error);
      return [];
    }
  }

  // Convertir URL de Google Drive para que funcione como imagen
  convertGoogleDriveUrl(url: string): string {
    if (!url) return '';
    
    // Extraer el file ID de la URL
    const fileIdMatch = url.match(/id=([^&]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Usar el formato de thumbnail de Google Drive
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    
    return url;
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

  clearForm(): void {
    this.nombre = '';
    this.descripcion = '';
    const today = new Date().toISOString().split('T')[0];
    this.fechaImagen = today;
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Limpiar input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    // Validaciones
    if (!this.nombre.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return;
    }
    
    if (!this.fechaImagen) {
      this.errorMessage = 'La fecha es obligatoria';
      return;
    }
    
    if (!this.selectedFile) {
      this.errorMessage = 'Debes seleccionar una imagen';
      return;
    }
    
    // Crear FormData
    const formData = new FormData();
    formData.append('nombre', this.nombre.trim());
    formData.append('descripcion', this.descripcion.trim());
    formData.append('fecha_imagen', this.fechaImagen);
    formData.append('file', this.selectedFile);
    
    // Enviar al servidor
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.imagenesService.createImagen(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Imagen subida correctamente';
          this.clearForm();
          this.loadImagenes(); // Recargar lista
          
          // Limpiar mensaje después de 5 segundos
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al subir imagen:', error);
        this.errorMessage = error.error?.error || 'Error al subir la imagen. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  confirmDelete(imagen: Imagen): void {
    this.imagenToDelete = imagen;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.imagenToDelete = null;
  }

  deleteImagen(): void {
    if (!this.imagenToDelete?.id) return;
    
    this.loading = true;
    this.imagenesService.deleteImagen(this.imagenToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Imagen eliminada correctamente';
        this.showDeleteModal = false;
        this.imagenToDelete = null;
        this.loadImagenes();
        this.loading = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Error al eliminar imagen:', error);
        this.errorMessage = 'Error al eliminar la imagen';
        this.showDeleteModal = false;
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Funciones de edición
  openEditModal(imagen: Imagen): void {
    this.imagenToEdit = imagen;
    this.editNombre = imagen.nombre;
    this.editDescripcion = imagen.descripcion || '';
    this.editFechaImagen = imagen.fecha_imagen.split('T')[0]; // Formato YYYY-MM-DD
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.imagenToEdit = null;
    this.editNombre = '';
    this.editDescripcion = '';
    this.editFechaImagen = '';
  }

  saveEdit(): void {
    if (!this.imagenToEdit?.id) return;

    // Validaciones
    if (!this.editNombre.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return;
    }

    if (!this.editFechaImagen) {
      this.errorMessage = 'La fecha es obligatoria';
      return;
    }

    const updateData = {
      nombre: this.editNombre.trim(),
      descripcion: this.editDescripcion.trim(),
      fecha_imagen: this.editFechaImagen
    };

    this.loading = true;
    this.errorMessage = '';

    this.imagenesService.updateImagen(this.imagenToEdit.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Imagen actualizada correctamente';
          this.closeEditModal();
          this.loadImagenes();

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al actualizar imagen:', error);
        this.errorMessage = error.error?.error || 'Error al actualizar la imagen';
        this.loading = false;
      }
    });
  }
}