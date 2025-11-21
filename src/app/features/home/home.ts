import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InformacionEventoComponent } from '../informacion-evento/informacion-evento.component';
import { ImagenesService } from '../../services/imagenes';
import { NoticiasService, Noticia } from '../../services/noticias';
import { EquiposService } from '../../services/equipos';
import { ResultadosService } from '../../services/resultados';
import { Equipo } from '../../interfaces/equipo';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { environment } from '../../../environments/environment';

interface GalleryItem {
  imagen: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, InformacionEventoComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  countdownInterval: any;
  clasificacionInterval: any;

  // CONFIGURACIÓN: Cambiar a true para mostrar preview de clasificación
  // true = Muestra la clasificación en vivo (para pruebas o cuando el evento esté en curso)
  // false = Muestra la cuenta regresiva hasta el día del evento
  mostrarPreviewClasificacion = false;
  
  // Estado de inscripciones desde environment
  inscripcionesAbiertas = environment.inscripcionesAbiertas;

  // Propiedades para la cuenta regresiva
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  eventoIniciado = false;

  // Preview de clasificación
  topEquipos: any[] = [];
  loadingClasificacion = false;
  resultadosVisibles = true;

  // Noticias
  noticias: Noticia[] = [];
  loadingNoticias = true;

  // Galería
  galeria: GalleryItem[] = [];
  loadingGallery = true;
  galleryRotationInterval: any;
  private imagesByYear = new Map<number, any[]>();
  private currentIndices = { 2024: 0, 2023: 0 };
  private usedImageUrls = new Set<string>(); // Para rastrear imágenes actualmente mostradas
  private imagenesNoticiasIds: string[] = []; // IDs de imágenes usadas en noticias



  constructor(
    private imagenesService: ImagenesService,
    private noticiasService: NoticiasService,
    private equiposService: EquiposService,
    private resultadosService: ResultadosService
  ) { }

  ngOnInit(): void {
    this.initCountdown();
    this.loadGalleryImages();
    this.loadNoticias();
    
    // Si está configurado para mostrar preview, cargar clasificación
    if (this.mostrarPreviewClasificacion) {
      this.loadClasificacionPreview();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.galleryRotationInterval) {
      clearInterval(this.galleryRotationInterval);
    }
    if (this.clasificacionInterval) {
      clearInterval(this.clasificacionInterval);
    }
  }

  private loadNoticias(): void {
    this.loadingNoticias = true;
    this.noticiasService.listarNoticias().subscribe({
      next: (response) => {
        if (response.success) {
          // Tomar solo las 3 noticias más recientes
          this.noticias = response.data.slice(0, 3);
        }
        this.loadingNoticias = false;
      },
      error: (error) => {
        console.error('Error al cargar noticias:', error);
        this.loadingNoticias = false;
      }
    });
  }

  private async loadGalleryImages(): Promise<void> {
    this.loadingGallery = true;

    try {
      // Primero obtener los IDs de imágenes usadas en noticias
      await this.getImagenesDeNoticias();

      // Luego cargar las imágenes de galería
      this.imagenesService.getImagenes().subscribe({
        next: (response) => {
          if (response.success && response.data.length > 0) {
            // Filtrar imágenes que NO están en noticias
            const imagenesGaleria = response.data.filter(img => {
              return !this.imagenesNoticiasIds.includes(img.id || '');
            });

            // Agrupar imágenes por año
            this.imagesByYear.clear();

            imagenesGaleria.forEach(img => {
              const year = new Date(img.fecha_imagen).getFullYear();
              if (!this.imagesByYear.has(year)) {
                this.imagesByYear.set(year, []);
              }
              this.imagesByYear.get(year)?.push(img);
            });

            // Mezclar aleatoriamente las imágenes de cada año
            this.imagesByYear.forEach((images, year) => {
              this.imagesByYear.set(year, this.shuffleArray(images));
            });

            // Seleccionar imágenes iniciales
            this.updateGalleryImages();

            // Iniciar rotación automática
            this.startGalleryRotation();
          } else {
            this.galeria = [];
          }

          this.loadingGallery = false;
        },
        error: (error) => {
          console.error('Error al cargar imágenes de galería:', error);
          this.galeria = [];
          this.loadingGallery = false;
        }
      });
    } catch (error) {
      console.error('Error al obtener imágenes de noticias:', error);
      this.loadingGallery = false;
    }
  }

  private async getImagenesDeNoticias(): Promise<void> {
    try {
      const response = await this.noticiasService.listarNoticias().toPromise();
      if (response && response.success) {
        // Extraer los IDs de las imágenes de todas las noticias
        this.imagenesNoticiasIds = response.data
          .filter(noticia => noticia.imagen && noticia.imagen.id)
          .map(noticia => noticia.imagen!.id);
      }
    } catch (error) {
      console.error('Error obteniendo imágenes de noticias:', error);
      this.imagenesNoticiasIds = [];
    }
  }

  private updateGalleryImages(): void {
    const selectedImages: GalleryItem[] = [];
    this.usedImageUrls.clear();

    // Recopilar todas las imágenes disponibles
    const allImages: any[] = [];
    this.imagesByYear.forEach((images) => {
      allImages.push(...images);
    });

    // Si hay menos de 4 imágenes únicas, mostrar solo las disponibles
    const maxImages = Math.min(4, allImages.length);

    // Seleccionar imágenes únicas
    let attempts = 0;
    const maxAttempts = allImages.length * 2;

    while (selectedImages.length < maxImages && attempts < maxAttempts) {
      // Priorizar 2024 y 2023
      let img;
      if (selectedImages.length < 2) {
        const images2024 = this.imagesByYear.get(2024) || [];
        if (images2024.length > 0) {
          const index = (this.currentIndices[2024] + selectedImages.length) % images2024.length;
          img = images2024[index];
        }
      } else if (selectedImages.length < 4) {
        const images2023 = this.imagesByYear.get(2023) || [];
        if (images2023.length > 0) {
          const index = (this.currentIndices[2023] + (selectedImages.length - 2)) % images2023.length;
          img = images2023[index];
        }
      }

      // Si no hay suficientes de 2024/2023, usar otros años
      if (!img) {
        const randomIndex = Math.floor(Math.random() * allImages.length);
        img = allImages[randomIndex];
      }

      const imageUrl = this.convertGoogleDriveUrl(img.url);

      // Solo agregar si no está ya en uso
      if (!this.usedImageUrls.has(imageUrl)) {
        this.usedImageUrls.add(imageUrl);
        selectedImages.push({
          imagen: imageUrl,
          titulo: img.nombre,
          descripcion: img.descripcion || `Triatlón ${new Date(img.fecha_imagen).getFullYear()}`
        });
      }

      attempts++;
    }

    this.galeria = selectedImages;
  }

  private startGalleryRotation(): void {
    // Tiempos para la rotación de imagenes
    const initialDelays = [10000, 15000, 20000, 25000];
    const intervals = [20200, 20500, 20800, 20300];

    initialDelays.forEach((delay, index) => {
      setTimeout(() => {
        // Primera rotación
        this.rotateImage(index);

        // Luego rotar con intervalos ligeramente diferentes
        setInterval(() => {
          this.rotateImage(index);
        }, intervals[index]);
      }, delay);
    });
  }

  private rotateImage(index: number): void {
    if (!this.galeria[index]) return;

    // Recopilar todas las imágenes disponibles
    const allImages: any[] = [];
    this.imagesByYear.forEach((images) => {
      allImages.push(...images);
    });

    // Si hay 4 o menos imágenes únicas, no rotar
    if (allImages.length <= 4) return;

    // Buscar una nueva imagen que no esté actualmente en uso
    let newImage: GalleryItem | null = null;
    let attempts = 0;
    const maxAttempts = allImages.length;

    while (!newImage && attempts < maxAttempts) {
      // Seleccionar imagen aleatoria
      const randomIndex = Math.floor(Math.random() * allImages.length);
      const img = allImages[randomIndex];
      const imageUrl = this.convertGoogleDriveUrl(img.url);

      // Verificar que no esté actualmente en uso
      if (!this.usedImageUrls.has(imageUrl)) {
        newImage = {
          imagen: imageUrl,
          titulo: img.nombre,
          descripcion: img.descripcion || `Triatlón ${new Date(img.fecha_imagen).getFullYear()}`
        };
      }

      attempts++;
    }

    // Solo actualizar si encontramos una nueva imagen diferente
    if (newImage && this.galeria[index] && newImage.imagen !== this.galeria[index].imagen) {
      // Remover la URL antigua del set
      this.usedImageUrls.delete(this.galeria[index].imagen);
      
      // Añadir la nueva URL al set
      this.usedImageUrls.add(newImage.imagen);

      // Añadir clase de animación al elemento
      const galleryItems = document.querySelectorAll('.gallery-item');
      if (galleryItems[index]) {
        galleryItems[index].classList.add('image-transition');

        // Cambiar la imagen después de un breve delay
        setTimeout(() => {
          this.galeria[index] = newImage!;
          this.galeria = [...this.galeria];

          // Remover la clase después de la animación
          setTimeout(() => {
            if (galleryItems[index]) {
              galleryItems[index].classList.remove('image-transition');
            }
          }, 800);
        }, 100);
      }
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // TrackBy function para optimizar el rendering
  trackByIndex(index: number): number {
    return index;
  }

  // Convertir URL de Google Drive para que funcione como imagen
  private convertGoogleDriveUrl(url: string): string {
    if (!url) return '';

    const fileIdMatch = url.match(/id=([^&]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    return url;
  }

  // Obtener URL de imagen de noticia
  getNoticiaImagen(noticia: Noticia): string {
    const url = noticia.imagen?.url;
    if (!url) {
      return 'https://picsum.photos/seed/default/800/600.jpg';
    }
    return this.convertGoogleDriveUrl(url);
  }

  // Formatear fecha de noticia
  formatearFechaNoticia(fecha: string): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const date = new Date(fecha);
    return `${date.getDate()} de ${meses[date.getMonth()]}, ${date.getFullYear()}`;
  }

  // Obtener ID de noticia
  getNoticiaId(noticia: Noticia): string {
    return noticia.id || '';
  }

  private initCountdown(): void {
    // Establecer fecha del evento 
    const eventDate = new Date('Nov 13, 2025 07:00:00').getTime();

    // Actualizar cuenta regresiva cada segundo
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      // Cálculos para días, horas, minutos y segundos
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Si la cuenta regresiva termina
      if (distance < 0) {
        clearInterval(this.countdownInterval);
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.eventoIniciado = true;
        
        // Cargar clasificación cuando el evento inicia
        this.loadClasificacionPreview();
      }
    }, 1000);
  }

  private loadClasificacionPreview(): void {
    this.loadingClasificacion = true;
    
    // Cargar datos de clasificación y verificar visibilidad
    combineLatest([
      this.equiposService.getEquipos().pipe(
        map(equipos => {
          // Filtrar equipos con posición y ordenar
          const equiposOrdenados = equipos
            .filter(e => e.posicion && e.tiempo_total && e.tiempo_total !== '00:00:00')
            .sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
          
          // Tomar solo los primeros 5
          return equiposOrdenados.slice(0, 5);
        })
      ),
      this.resultadosService.getVisibilidadResultados()
    ]).subscribe({
      next: ([equipos, visibles]) => {
        this.resultadosVisibles = visibles;
        
        if (visibles) {
          this.topEquipos = equipos.map(e => ({
            posicion: e.posicion || 0,
            nombre: e.nombre,
            tiempo_total: e.tiempo_total || '00:00:00',
            id: e.id
          }));
          
          // Iniciar actualización automática cada 30 segundos
          if (!this.clasificacionInterval) {
            this.clasificacionInterval = setInterval(() => {
              this.actualizarClasificacion();
            }, 30000); // 30 segundos
          }
        } else {
          this.topEquipos = [];
        }
        
        this.loadingClasificacion = false;
      },
      error: (error) => {
        console.error('Error cargando clasificación:', error);
        this.topEquipos = [];
        this.loadingClasificacion = false;
      }
    });
  }

  private actualizarClasificacion(): void {
    // Actualizar sin mostrar loading para no interrumpir la visualización
    this.equiposService.getEquipos().pipe(
      map(equipos => {
        const equiposOrdenados = equipos
          .filter(e => e.posicion && e.tiempo_total && e.tiempo_total !== '00:00:00')
          .sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
        
        return equiposOrdenados.slice(0, 5);
      })
    ).subscribe({
      next: (equipos) => {
        this.topEquipos = equipos.map(e => ({
          posicion: e.posicion || 0,
          nombre: e.nombre,
          tiempo_total: e.tiempo_total || '00:00:00',
          id: e.id
        }));
      },
      error: (error) => {
        console.error('Error actualizando clasificación:', error);
      }
    });
  }
}