import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Loading } from '../../components/loading/loading';
import { EquiposService } from '../../services/equipos';
import { Equipo } from '../../interfaces/equipo';
import { Participante } from '../../interfaces/participante'; // Asegúrate de tener esta interfaz

@Component({
  selector: 'app-gestion-equipos',
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './gestion-equipos.html',
  styleUrls: ['./gestion-equipos.scss']
})
export class GestionEquipos implements OnInit {

  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  participantes: Participante[] = [];

  loadingEquipos = false;
  loadingParticipantes = false;

  successMessage = '';
  errorMessage = '';

  // Variables de control de modales
  showDeleteModal = false;
  showEditModal = false;
  showParticipantsModal = false;

  // Variables de equipo seleccionado
  equipoToDelete?: Equipo;
  equipoToEdit?: Equipo;
  equipoSelected?: Equipo;

  // Variables de filtros
  searchTerm = '';
  selectedYear = '';
  availableYears: string[] = [];

  constructor(private equiposService: EquiposService) {}

  ngOnInit(): void {
    this.loadEquipos();
  }

  /** Cargar equipos */
  loadEquipos() {
    this.loadingEquipos = true;
    this.equiposService.getEquipos().subscribe({
      next: (data) => {
        this.equipos = data.filter(e => e.visible); // solo visibles
        this.extractYears();
        this.applyFilters();
        this.loadingEquipos = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los equipos';
        console.error(err);
        this.loadingEquipos = false;
      }
    });
  }

  /** Extraer años únicos de los equipos */
  extractYears() {
    const years = this.equipos.map(equipo => {
      const date = new Date(equipo.created_at);
      return date.getFullYear().toString();
    });
    this.availableYears = [...new Set(years)].sort((a, b) => b.localeCompare(a));
  }

  /** Aplicar filtros de búsqueda y año */
  applyFilters() {
    let filtered = [...this.equipos];

    // Filtro por búsqueda de nombre
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(equipo => 
        equipo.nombre.toLowerCase().includes(term)
      );
    }

    // Filtro por año
    if (this.selectedYear) {
      filtered = filtered.filter(equipo => {
        const year = new Date(equipo.created_at).getFullYear().toString();
        return year === this.selectedYear;
      });
    }

    this.equiposFiltrados = filtered;
  }

  /** Limpiar filtros */
  clearFilters() {
    this.searchTerm = '';
    this.selectedYear = '';
    this.applyFilters();
  }

  /** Ver participantes del equipo (abre modal) */
  verParticipantes(equipo: Equipo) {
  if (!equipo.id) {
    console.warn('El equipo no tiene ID, no se puede cargar participantes.');
    return;
  }

  this.equipoSelected = equipo;
  this.showParticipantsModal = true;
  this.loadingParticipantes = true;

  this.equiposService.getParticipantes(equipo.id).subscribe({
    next: (participantes) => {
      this.participantes = participantes;
      this.loadingParticipantes = false;
    },
    error: (err) => {
      console.error('Error al obtener participantes', err);
      this.loadingParticipantes = false;
      this.errorMessage = 'Error al cargar los participantes';
    }
  });
}

  /** Cierra modal de participantes */
  closeParticipantsModal() {
    this.showParticipantsModal = false;
    this.equipoSelected = undefined;
    this.participantes = [];
  }

  /** Formatear fecha */
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /** Mostrar modal de confirmación de eliminación */
  confirmDelete(equipo: Equipo) {
    this.equipoToDelete = equipo;
    this.showDeleteModal = true;
  }

  /** Cancelar eliminación */
  cancelDelete() {
    this.showDeleteModal = false;
    this.equipoToDelete = undefined;
  }

  /** Eliminar equipo */
  deleteEquipo() {
    if (!this.equipoToDelete) return;

    this.equiposService.deleteEquipo(this.equipoToDelete.id!).subscribe({
      next: () => {
        this.successMessage = 'Equipo eliminado correctamente';
        this.loadEquipos();
      },
      error: () => this.errorMessage = 'Error al eliminar el equipo',
      complete: () => this.cancelDelete()
    });
  }

  /** Abrir modal de edición */
  openEditModal(equipo: Equipo) {
    this.equipoToEdit = { ...equipo };
    this.showEditModal = true;
  }

  /** Cerrar modal de edición */
  closeEditModal() {
    this.showEditModal = false;
    this.equipoToEdit = undefined;
  }

  /** Guardar cambios del equipo */
  saveEdit() {
    if (!this.equipoToEdit) return;

    this.equiposService.updateEquipo(this.equipoToEdit.id!, this.equipoToEdit).subscribe({
      next: () => {
        this.successMessage = 'Equipo actualizado correctamente';
        this.loadEquipos();
      },
      error: () => this.errorMessage = 'Error al actualizar equipo',
      complete: () => this.closeEditModal()
    });
  }
}
