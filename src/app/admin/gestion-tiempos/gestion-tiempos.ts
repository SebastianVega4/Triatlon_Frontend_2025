import { Component, OnInit } from '@angular/core';
import { EquiposService } from '../../services/equipos';
import { ResultadosService } from '../../services/resultados';
import { CommonModule } from '@angular/common';
import { Loading } from '../../components/loading/loading';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion-tiempos',
  standalone: true,
  imports: [CommonModule, Loading, FormsModule, RouterModule],
  templateUrl: './gestion-tiempos.html',
  styleUrls: ['./gestion-tiempos.scss']
})
export class GestionTiempos implements OnInit {
  equipos: any[] = [];
  equiposFiltrados: any[] = [];
  equipoSeleccionado: any = null;
  participantes: any[] = [];
  loading = true;
  tiempoEditando: { [key: string]: boolean } = {};
  terminoBusqueda: string = '';
  mostrarModal: boolean = false;

  constructor(
    private equiposService: EquiposService,
    private resultadosService: ResultadosService
  ) { }

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.equiposService.getEquipos().subscribe(equipos => {
      this.equipos = equipos;
      this.equiposFiltrados = [...equipos];
      this.loading = false;
    });
  }

  filtrarEquipos(): void {
    if (!this.terminoBusqueda) {
      this.equiposFiltrados = [...this.equipos];
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    this.equiposFiltrados = this.equipos.filter(equipo =>
      equipo.nombre.toLowerCase().includes(termino)
    );
  }

  abrirModalEquipo(equipoId: string): void {
    this.mostrarModal = true;
    this.cargarEquipo(equipoId);
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.equipoSeleccionado = null;
    this.participantes = [];
    this.tiempoEditando = {};
  }

  cambiarEquipo(equipoId: string): void {
    this.cargarEquipo(equipoId);
  }

  private cargarEquipo(equipoId: string): void {
    this.equipoSeleccionado = this.equipos.find(e => e.id === equipoId);
    this.equiposService.getParticipantes(equipoId).subscribe(participantes => {
      this.participantes = participantes.sort((a, b) => {
        const order = ['natacion', 'ciclismo', 'atletismo'];
        const disciplinaA = a.disciplina || '';
        const disciplinaB = b.disciplina || '';
        return order.indexOf(disciplinaA) - order.indexOf(disciplinaB);
      });
      this.participantes.forEach(p => {
        this.tiempoEditando[p.id] = false;
      });
    });
  }

  getIconoDisciplina(disciplina: string): string {
    const iconos: { [key: string]: string } = {
      natacion: 'bi-droplet',
      ciclismo: 'bi-bicycle',
      atletismo: 'bi-person-running',
    };
    return iconos[disciplina] || 'bi-question-circle';
  }

  formatTimeInput(event: any, participanteId: string): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) value = value.substring(0, 2) + ':' + value.substring(2);
    if (value.length > 5) value = value.substring(0, 5) + ':' + value.substring(5);
    if (value.length > 8) value = value.substring(0, 8) + '.' + value.substring(8);
    if (value.length > 12) value = value.substring(0, 12);

    event.target.value = value;

    const participante = this.participantes.find(p => p.id === participanteId);
    if (participante) {
      participante.tiempo = value;
    }
  }

  editarTiempo(participanteId: string): void {
    this.tiempoEditando[participanteId] = true;
  }

  // Añadir este método que falta
  validarFormatoTiempo(tiempo: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d{1,3})?$/.test(tiempo);
  }

  guardarTiempo(participante: any, nuevoTiempo: string): void {
    if (!this.validarFormatoTiempo(nuevoTiempo)) {
      alert('Formato de tiempo inválido. Use HH:MM:SS.000');
      return;
    }

    this.equiposService.updateParticipante(
      participante.equipo_id,
      participante.id,
      { tiempo: nuevoTiempo }
    ).subscribe({
      next: () => {
        this.resultadosService.calcularTiempoTotal(participante.equipo_id).subscribe({
          next: () => {
            this.resultadosService.actualizarPosiciones().subscribe({
              next: () => {
                this.tiempoEditando[participante.id] = false;
                this.cargarEquipos();
              },
              error: (error) => {
                console.error('Error actualizando posiciones:', error);
                alert('Error actualizando posiciones');
              }
            });
          },
          error: (error) => {
            console.error('Error calculando tiempo total:', error);
            alert('Error calculando tiempo total');
          }
        });
      },
      error: (error) => {
        console.error('Error actualizando tiempo:', error);
        alert('Error actualizando tiempo');
      }
    });
  }

  aplicarPenalizacion(participante: any): void {
    if (!participante.disciplina) {
      alert('El participante debe tener una disciplina asignada');
      return;
    }

    if (confirm(`¿Aplicar penalización de 5 minutos al participante ${participante.nombre}?`)) {
      this.resultadosService.aplicarPenalizacion(
        participante.id,
        participante.disciplina
      ).subscribe({
        next: () => {
          alert('Penalización aplicada correctamente');
          this.cargarEquipos();
        },
        error: (error: Error) => {
          console.error('Error al aplicar penalización:', error);
          alert('Error aplicando penalización: ' + error.message);
        }
      });
    }
  }

  asignarPremioEspecial(participante: any): void {
    if (confirm(`¿Asignar premio especial a ${participante.nombre}?`)) {
      this.resultadosService.setPremioEspecial(participante.id)
        .subscribe({
          next: () => alert('Premio especial asignado'),
          error: (error: any) => {
            console.error('Error asignando premio:', error);
            alert('Error asignando premio');
          }
        });
    }
  }
}