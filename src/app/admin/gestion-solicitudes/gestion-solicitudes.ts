import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Loading } from '../../components/loading/loading';
import { EquiposService } from '../../services/equipos';
import { CorreoService } from '../../services/correo';
import { Upload } from '../../services/upload';
import { Equipo } from '../../interfaces/equipo';
import { Participante } from '../../interfaces/participante';

@Component({
  selector: 'app-gestion-solicitudes',
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './gestion-solicitudes.html',
  styleUrls: ['./gestion-solicitudes.scss']
})
export class GestionSolicitudes implements OnInit {
  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  participantes: Participante[] = [];

  loadingEquipos = false;
  loadingParticipantes = false;
  processingAction = false;

  successMessage = '';
  errorMessage = '';
  
  // Timers para auto-cerrar notificaciones
  private successTimer?: any;
  private errorTimer?: any;

  // Modales
  showApproveModal = false;
  showRejectModal = false;
  showParticipantsModal = false;
  showDisapproveModal = false;
  showDocumentModal = false;
  showReviewModal = false;

  // Equipo seleccionado
  equipoSelected?: Equipo;
  
  // URL del documento cacheada para evitar recargas
  cachedDocumentUrl?: SafeResourceUrl;

  // Mensajes personalizados
  mensajeAprobacion = '';
  mensajeRechazo = '';
  mensajeDesaprobacion = '';

  // Filtros
  searchTerm = '';

  // Vista actual: 'pendientes' o 'aprobados'
  vistaActual: 'pendientes' | 'aprobados' = 'pendientes';

  constructor(
    private equiposService: EquiposService,
    private correoService: CorreoService,
    private uploadService: Upload,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadEquipos();
  }

  loadEquipos() {
    this.loadingEquipos = true;
    this.equiposService.getAllEquipos().subscribe({
      next: (data) => {
        // Filtrar según la vista actual
        if (this.vistaActual === 'pendientes') {
          this.equipos = data.filter(e => e.visible === false);
        } else {
          this.equipos = data.filter(e => e.visible === true);
        }
        this.applyFilters();
        this.loadingEquipos = false;
      },
      error: (err) => {
        this.mostrarNotificacion('error', 'Error al cargar las solicitudes');
        console.error(err);
        this.loadingEquipos = false;
      }
    });
  }

  cambiarVista(vista: 'pendientes' | 'aprobados') {
    this.vistaActual = vista;
    this.searchTerm = '';
    this.loadEquipos();
  }

  applyFilters() {
    let filtered = [...this.equipos];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(equipo =>
        equipo.nombre.toLowerCase().includes(term)
      );
    }

    this.equiposFiltrados = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.applyFilters();
  }

  verParticipantes(equipo: Equipo) {
    if (!equipo.id) return;

    this.equipoSelected = equipo;
    this.showParticipantsModal = true;
    this.loadingParticipantes = true;

    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

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

  closeParticipantsModal() {
    this.showParticipantsModal = false;
    this.equipoSelected = undefined;
    this.participantes = [];
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  openApproveModal(equipo: Equipo) {
    this.equipoSelected = equipo;
    this.mensajeAprobacion = '';
    this.showApproveModal = true;
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
  }

  closeApproveModal() {
    this.showApproveModal = false;
    // Si el modal de revisión está abierto, no limpiar el equipo seleccionado
    if (!this.showRejectModal && !this.showReviewModal) {
      this.equipoSelected = undefined;
      // Restaurar scroll del body solo si no hay otros modales abiertos
      document.body.style.overflow = '';
    }
    this.mensajeAprobacion = '';
  }

  openRejectModal(equipo: Equipo) {
    this.equipoSelected = equipo;
    this.mensajeRechazo = '';
    this.showRejectModal = true;
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
  }

  closeRejectModal() {
    this.showRejectModal = false;
    // Si el modal de revisión está abierto, no limpiar el equipo seleccionado
    if (!this.showApproveModal && !this.showReviewModal) {
      this.equipoSelected = undefined;
      // Restaurar scroll del body solo si no hay otros modales abiertos
      document.body.style.overflow = '';
    }
    this.mensajeRechazo = '';
  }

  openDisapproveModal(equipo: Equipo) {
    this.equipoSelected = equipo;
    this.mensajeDesaprobacion = '';
    this.showDisapproveModal = true;
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
  }

  closeDisapproveModal() {
    this.showDisapproveModal = false;
    this.equipoSelected = undefined;
    this.mensajeDesaprobacion = '';
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  aprobarEquipo() {
    if (!this.equipoSelected || !this.equipoSelected.id) return;

    this.processingAction = true;

    // Primero hacer visible el equipo
    this.equiposService.updateEquipo(this.equipoSelected.id, { visible: true }).subscribe({
      next: () => {
        // Obtener el correo del delegado
        this.equiposService.getParticipantes(this.equipoSelected!.id!).subscribe({
          next: (participantes) => {
            const delegado = participantes.find(p => p.delegado);
            if (delegado && delegado.correo) {
              // Enviar correo de aprobación
              this.correoService.enviarCorreoAprobado(delegado.correo, this.mensajeAprobacion).subscribe({
                next: () => {
                  this.mostrarNotificacion('success', `Equipo "${this.equipoSelected!.nombre}" aprobado y correo enviado correctamente`);
                  this.loadEquipos();
                  this.closeApproveModal();
                  this.closeReviewModal();
                  this.processingAction = false;
                },
                error: (err) => {
                  console.error('Error al enviar correo', err);
                  this.mostrarNotificacion('error', 'Equipo aprobado pero hubo un error al enviar el correo');
                  this.loadEquipos();
                  this.closeApproveModal();
                  this.closeReviewModal();
                  this.processingAction = false;
                }
              });
            } else {
              this.mostrarNotificacion('error', 'No se encontró un delegado con correo para este equipo');
              this.processingAction = false;
            }
          },
          error: (err) => {
            console.error('Error al obtener participantes', err);
            this.mostrarNotificacion('error', 'Error al obtener información del delegado');
            this.processingAction = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al aprobar equipo', err);
        this.mostrarNotificacion('error', 'Error al aprobar el equipo');
        this.processingAction = false;
      }
    });
  }

  rechazarEquipo() {
    if (!this.equipoSelected || !this.equipoSelected.id) return;

    this.processingAction = true;

    // Obtener el correo del delegado antes de eliminar
    this.equiposService.getParticipantes(this.equipoSelected.id).subscribe({
      next: (participantes) => {
        const delegado = participantes.find(p => p.delegado);
        if (delegado && delegado.correo) {
          // Enviar correo de rechazo
          this.correoService.enviarCorreoRechazado(delegado.correo, this.mensajeRechazo).subscribe({
            next: () => {
              // Eliminar el equipo
              this.equiposService.deleteEquipo(this.equipoSelected!.id!).subscribe({
                next: () => {
                  this.mostrarNotificacion('success', `Equipo "${this.equipoSelected!.nombre}" rechazado y correo enviado correctamente`);
                  this.loadEquipos();
                  this.closeRejectModal();
                  this.closeReviewModal();
                  this.processingAction = false;
                },
                error: (err) => {
                  console.error('Error al eliminar equipo', err);
                  this.mostrarNotificacion('error', 'Correo enviado pero hubo un error al eliminar el equipo');
                  this.closeRejectModal();
                  this.closeReviewModal();
                  this.processingAction = false;
                }
              });
            },
            error: (err) => {
              console.error('Error al enviar correo', err);
              this.mostrarNotificacion('error', 'Error al enviar el correo de rechazo');
              this.processingAction = false;
            }
          });
        } else {
          this.mostrarNotificacion('error', 'No se encontró un delegado con correo para este equipo');
          this.processingAction = false;
        }
      },
      error: (err) => {
        console.error('Error al obtener participantes', err);
        this.mostrarNotificacion('error', 'Error al obtener información del delegado');
        this.processingAction = false;
      }
    });
  }

  desaprobarEquipo() {
    if (!this.equipoSelected || !this.equipoSelected.id) return;

    this.processingAction = true;

    // Cambiar visible a false (sin enviar correo)
    this.equiposService.updateEquipo(this.equipoSelected.id, { visible: false }).subscribe({
      next: () => {
        this.mostrarNotificacion('success', `Equipo "${this.equipoSelected!.nombre}" desaprobado correctamente`);
        this.loadEquipos();
        this.closeDisapproveModal();
        this.processingAction = false;
      },
      error: (err) => {
        console.error('Error al desaprobar equipo', err);
        this.mostrarNotificacion('error', 'Error al desaprobar el equipo');
        this.processingAction = false;
      }
    });
  }

  verDocumento(equipo: Equipo) {
    this.equipoSelected = equipo;
    this.showDocumentModal = true;
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
  }

  closeDocumentModal() {
    this.showDocumentModal = false;
    this.equipoSelected = undefined;
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  getDocumentUrl(documentoId: string | undefined): SafeResourceUrl {
    if (!documentoId) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    const url = this.uploadService.getFileViewUrl(documentoId);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getDownloadUrl(documentoId: string | undefined): string {
    if (!documentoId) return '#';
    return this.uploadService.getFileDownloadUrl(documentoId);
  }

  abrirRevisionCompleta(equipo: Equipo) {
    if (!equipo.id) return;

    this.equipoSelected = equipo;
    this.showReviewModal = true;
    this.loadingParticipantes = true;

    // Cachear la URL del documento para evitar recargas
    if (equipo.documento_id) {
      this.cachedDocumentUrl = this.getDocumentUrl(equipo.documento_id);
    }

    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    // Cargar participantes
    this.equiposService.getParticipantes(equipo.id).subscribe({
      next: (participantes) => {
        this.participantes = participantes;
        this.loadingParticipantes = false;
      },
      error: (err) => {
        console.error('Error al obtener participantes', err);
        this.loadingParticipantes = false;
        this.mostrarNotificacion('error', 'Error al cargar los participantes');
      }
    });
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.equipoSelected = undefined;
    this.participantes = [];
    this.cachedDocumentUrl = undefined; // Limpiar cache
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  openApproveModalFromReview() {
    // No cerrar el modal de revisión, solo abrir el de confirmación encima
    this.mensajeAprobacion = '';
    this.showApproveModal = true;
  }

  openRejectModalFromReview() {
    // No cerrar el modal de revisión, solo abrir el de confirmación encima
    this.mensajeRechazo = '';
    this.showRejectModal = true;
  }

  cerrarNotificacion(tipo: 'success' | 'error') {
    if (tipo === 'success') {
      this.successMessage = '';
      if (this.successTimer) {
        clearTimeout(this.successTimer);
      }
    } else {
      this.errorMessage = '';
      if (this.errorTimer) {
        clearTimeout(this.errorTimer);
      }
    }
  }

  private mostrarNotificacion(tipo: 'success' | 'error', mensaje: string) {
    if (tipo === 'success') {
      // Limpiar timer anterior si existe
      if (this.successTimer) {
        clearTimeout(this.successTimer);
      }
      
      this.successMessage = mensaje;
      
      // Auto-cerrar después de 5 segundos
      this.successTimer = setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    } else {
      // Limpiar timer anterior si existe
      if (this.errorTimer) {
        clearTimeout(this.errorTimer);
      }
      
      this.errorMessage = mensaje;
      
      // Auto-cerrar después de 5 segundos
      this.errorTimer = setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota'
    });
  }
}
