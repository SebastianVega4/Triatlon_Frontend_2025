import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagenesService } from '../../services/imagenes';
import { NoticiasService } from '../../services/noticias';
import { Loading } from '../../components/loading/loading';
import { firstValueFrom } from 'rxjs';

interface GalleryImage {
  id: string;
  year: string;
  title: string;
  description: string;
  url: string;
  fecha_imagen: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, Loading],
  templateUrl: './galeria.html',
  styleUrls: ['./galeria.scss']
})
export class Galeria implements OnInit {
  activeFilter = 'all';
  showModal = false;
  selectedImage: GalleryImage | null = null;
  loading = true;
  error = '';

  galleryImages: GalleryImage[] = [];
  filteredImages: GalleryImage[] = [];

  constructor(
    private imagenesService: ImagenesService,
    private noticiasService: NoticiasService
  ) { }

  ngOnInit(): void {
    this.loadImages();
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

  async loadImages(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const imagenesNoticiasIds = await this.getImagenesDeNoticias();
      const response = await firstValueFrom(this.imagenesService.getImagenes());
      
      if (response.success) {
        const imagenesGaleria = response.data.filter(img => {
          return !imagenesNoticiasIds.includes(img.id || '');
        });

        this.galleryImages = imagenesGaleria.map(img => ({
          id: img.id || '',
          year: new Date(img.fecha_imagen).getFullYear().toString(),
          title: img.nombre,
          description: img.descripcion || '',
          url: this.convertGoogleDriveUrl(img.url),
          fecha_imagen: img.fecha_imagen
        }));
        this.filteredImages = [...this.galleryImages];
        this.loading = false;
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Status:', error.status);
      console.error('URL:', error.url);
      console.error('Mensaje:', error.message);

      if (error.status === 404) {
        this.error = 'El endpoint de imágenes no existe en el servidor. Verifica que el backend esté corriendo correctamente.';
      } else if (error.status === 0) {
        this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:5000';
      } else {
        this.error = `Error al cargar las imágenes (${error.status}). Por favor, intenta de nuevo.`;
      }
      this.loading = false;
    }
  }

  // Convertir URL de Google Drive para que funcione como imagen
  convertGoogleDriveUrl(url: string): string {
    // Si la URL ya tiene el formato correcto, devolverla
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

  setFilter(filter: string): void {
    this.activeFilter = filter;

    if (filter === 'all') {
      this.filteredImages = [...this.galleryImages];
    } else {
      this.filteredImages = this.galleryImages.filter(image => image.year === filter);
    }
  }

  openModal(image: GalleryImage): void {
    this.selectedImage = image;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedImage = null;
  }

  loadMoreImages(): void {
    // Recargar las imágenes desde el servidor
    this.loadImages();
  }

  getUniqueYears(): string[] {
    const years = [...new Set(this.galleryImages.map(img => img.year))];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}