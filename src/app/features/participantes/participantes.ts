import { Component, OnInit } from '@angular/core';
import { ParticipantesService } from '../../services/participantes';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Loading } from '../../components/loading/loading';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, FormsModule, Loading, HttpClientModule],
  templateUrl: './participantes.html',
  styleUrls: ['./participantes.scss'],
})
export class Participantes implements OnInit {
  participantes: any[] = [];
  participantesFiltrados: any[] = [];
  equiposAgrupados: any[] = [];
  terminoBusqueda: string = '';
  disciplinaFiltro: string = 'todas';
  agruparPorEquipo: boolean = true;
  loading = true;

  disciplinas = [
    { valor: 'todas', nombre: 'Todas las disciplinas' },
    { valor: 'natacion', nombre: 'Natación' },
    { valor: 'ciclismo', nombre: 'Ciclismo' },
    { valor: 'atletismo', nombre: 'Atletismo' }
  ];

  constructor(private participantesService: ParticipantesService) { }

  ngOnInit(): void {
    this.cargarParticipantes();
  }

  cargarParticipantes(): void {
    this.participantesService.getParticipantesConEquipos().subscribe({
      next: (participantes) => {
        this.participantes = participantes;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar participantes:', error);
        this.participantes = [];
        this.participantesFiltrados = [];
        this.loading = false;
      },
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.participantes];

    // Si está en vista por equipos y hay búsqueda, filtrar por equipos completos
    if (this.agruparPorEquipo && this.terminoBusqueda) {
      const termino = this.normalizarTexto(this.terminoBusqueda);

      // Encontrar equipos que coincidan con la búsqueda
      const equiposCoincidentes = new Set<string>();

      this.participantes.forEach(p => {
        const nombreNormalizado = this.normalizarTexto(p.nombre);
        const equipoNormalizado = this.normalizarTexto(p.equipoNombre || '');

        if (nombreNormalizado.includes(termino) || equipoNormalizado.includes(termino)) {
          equiposCoincidentes.add(p.equipoNombre || 'Sin equipo');
        }
      });

      // Incluir todos los participantes de los equipos coincidentes
      resultado = resultado.filter(p =>
        equiposCoincidentes.has(p.equipoNombre || 'Sin equipo')
      );
    } else if (!this.agruparPorEquipo && this.terminoBusqueda) {
      // En vista individual, filtrar normalmente
      const termino = this.normalizarTexto(this.terminoBusqueda);
      resultado = resultado.filter(
        (p) =>
          this.normalizarTexto(p.nombre).includes(termino) ||
          this.normalizarTexto(p.equipoNombre || '').includes(termino)
      );
    }

    // Filtrar por disciplina solo en vista individual
    if (this.disciplinaFiltro !== 'todas' && !this.agruparPorEquipo) {
      resultado = resultado.filter(p => p.disciplina === this.disciplinaFiltro);
    }

    this.participantesFiltrados = resultado;

    // Agrupar por equipo si está activado
    if (this.agruparPorEquipo) {
      this.agruparPorEquipos();
    }
  }

  normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Eliminar tildes y diacríticos
  }

  agruparPorEquipos(): void {
    const equiposMap = new Map<string, any>();

    this.participantesFiltrados.forEach(p => {
      const equipoNombre = p.equipoNombre || 'Sin equipo';

      if (!equiposMap.has(equipoNombre)) {
        equiposMap.set(equipoNombre, {
          nombre: equipoNombre,
          participantes: []
        });
      }

      equiposMap.get(equipoNombre)!.participantes.push(p);
    });

    this.equiposAgrupados = Array.from(equiposMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }

  filtrarParticipantes(): void {
    this.aplicarFiltros();
  }

  cambiarDisciplina(): void {
    this.aplicarFiltros();
  }

  toggleAgruparPorEquipo(): void {
    this.agruparPorEquipo = !this.agruparPorEquipo;

    // Si se activa la vista por equipos, quitar el filtro de disciplina
    if (this.agruparPorEquipo) {
      this.disciplinaFiltro = 'todas';
    }

    this.aplicarFiltros();
  }

  getIconoDisciplina(disciplina: string): string {
    const iconos: { [key: string]: string } = {
      natacion: 'bi-droplet',
      ciclismo: 'bi-bicycle',
      atletismo: 'bi-lightning',
    };
    return iconos[disciplina] || 'bi-question-circle';
  }

  getNombreDisciplina(disciplina: string): string {
    const nombres: { [key: string]: string } = {
      natacion: 'Natación',
      ciclismo: 'Ciclismo',
      atletismo: 'Atletismo',
    };
    return nombres[disciplina] || disciplina;
  }
}
