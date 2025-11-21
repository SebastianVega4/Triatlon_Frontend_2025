import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoticiasService, Noticia } from '../../services/noticias';

interface NoticiaLocal extends Noticia {
    destacada?: boolean;
}

@Component({
    selector: 'app-noticias',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './noticias.html',
    styleUrls: ['./noticias.scss']
})
export class Noticias implements OnInit {
    noticias: NoticiaLocal[] = [];
    noticiasFiltradas: NoticiaLocal[] = [];
    categorias: string[] = ['Todas'];
    categoriaActiva: string = 'Todas';
    noticiaDestacada: NoticiaLocal | null = null;
    noticiasSecundarias: NoticiaLocal[] = [];
    loading = true;
    error = '';
    
    // Paginación
    paginaActual: number = 1;
    noticiasPorPagina: number = 9; // 9 noticias por página (3x3 grid)
    totalPaginas: number = 1;

    constructor(private noticiasService: NoticiasService) {}

    ngOnInit(): void {
        this.cargarNoticias();
    }

    cargarNoticias(): void {
        this.loading = true;
        this.noticiasService.listarNoticias().subscribe({
            next: (response) => {
                if (response.success) {
                    // Convertir las noticias del backend al formato local
                    this.noticias = response.data.map((n, index) => ({
                        ...n,
                        destacada: index === 0 // La primera noticia es destacada
                    }));
                    
                    this.extraerCategorias();
                    this.separarNoticiaDestacada();
                    this.filtrarNoticias('Todas');
                    this.calcularTotalPaginas();
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error cargando noticias:', error);
                this.error = 'Error al cargar las noticias';
                this.loading = false;
            }
        });
    }

    extraerCategorias(): void {
        const categoriasUnicas = new Set(this.noticias.map(n => n.categoria));
        this.categorias = ['Todas', ...Array.from(categoriasUnicas)];
    }

    separarNoticiaDestacada(): void {
        this.noticiaDestacada = this.noticias.find(n => n.destacada) || null;
        this.noticiasSecundarias = this.noticias.filter(n => !n.destacada);
    }

    filtrarNoticias(categoria: string): void {
        this.categoriaActiva = categoria;
        this.paginaActual = 1; // Resetear a la primera página al cambiar filtro
        
        if (categoria === 'Todas') {
            this.noticiasFiltradas = this.noticiasSecundarias;
        } else {
            // Filtrar desde todas las noticias, no solo las secundarias
            this.noticiasFiltradas = this.noticias.filter(n => n.categoria === categoria);
        }
        
        this.calcularTotalPaginas();
    }

    calcularTotalPaginas(): void {
        const noticiasParaPaginar = this.categoriaActiva === 'Todas' 
            ? this.noticiasFiltradas.slice(1) // Excluir la destacada
            : this.noticiasFiltradas;
        
        this.totalPaginas = Math.ceil(noticiasParaPaginar.length / this.noticiasPorPagina);
    }

    getNoticiasPaginadas(): NoticiaLocal[] {
        const noticiasParaPaginar = this.categoriaActiva === 'Todas' 
            ? this.noticiasFiltradas.slice(1) // Excluir la destacada
            : this.noticiasFiltradas;
        
        const inicio = (this.paginaActual - 1) * this.noticiasPorPagina;
        const fin = inicio + this.noticiasPorPagina;
        
        return noticiasParaPaginar.slice(inicio, fin);
    }

    cambiarPagina(pagina: number): void {
        if (pagina >= 1 && pagina <= this.totalPaginas) {
            this.paginaActual = pagina;
            // Scroll suave hacia arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    getPaginasArray(): number[] {
        return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    }

    mostrarPaginacion(): boolean {
        return this.totalPaginas > 1;
    }

    formatearFecha(fecha: string): string {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const date = new Date(fecha);
        return `${date.getDate()} de ${meses[date.getMonth()]}, ${date.getFullYear()}`;
    }

    getImagenUrl(noticia: NoticiaLocal): string {
        const url = noticia.imagen?.url;
        if (!url) {
            return 'https://picsum.photos/seed/default/800/600.jpg';
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

    getNoticiaId(noticia: NoticiaLocal): string {
        // El backend devuelve el ID en el campo 'id'
        return noticia.id || '';
    }
}
