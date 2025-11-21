import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Galeria } from './features/galeria/galeria';
import { ListaEquipos } from './features/lista-equipos/lista-equipos';
import { Podio } from './features/podio/podio';
import { EquipoDetalle } from './features/equipo-detalle/equipo-detalle';
import { PremiosIndividuales } from './features/premios-individuales/premios-individuales';
import { ResultadosDisciplina } from './features/resultados-disciplina/resultados-disciplina';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { EditarEquipo } from './admin/editar-equipo/editar-equipo';
import { GestionTiempos } from './admin/gestion-tiempos/gestion-tiempos';
import { GestionImagenes } from './admin/gestion-imagenes/gestion-imagenes';
import { VisibilidadResultados } from './admin/visibilidad-resultados/visibilidad-resultados';
import { GestionNoticias } from './admin/gestion-noticias/gestion-noticias';
import { AdminGuard } from './guards/admin-guard';
import { Login } from './admin/login/login';
import { Participantes } from './features/participantes/participantes';
import { Resultados2024 } from './features/resultados-2024/resultados-2024';
import { Noticias } from './features/noticias/noticias';
import { NoticiaDetalle } from './features/noticia-detalle/noticia-detalle';
import { FormularioInscripcion } from './features/formulario-inscripcion/formulario-inscripcion';
import { GestionEquipos } from './admin/gestion-equipos/gestion-equipos';
import { GestionSolicitudes } from './admin/gestion-solicitudes/gestion-solicitudes';
import { EquipoTrabajo } from './features/equipo-trabajo/equipo-trabajo';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: Home, title: 'Triatlón Universitario UPTC 2025' },
  { path: 'galeria', component: Galeria, title: 'Galería Completa - Triatlón UPTC' },
  { path: 'noticias', component: Noticias, title: 'Noticias - Triatlón UPTC' },
  { path: 'noticia/:id', component: NoticiaDetalle, title: 'Detalle de Noticia - Triatlón UPTC' },
  { path: 'equipos', component: ListaEquipos, title: 'Lista de Equipos - Triatlón' },
  { path: 'podio', component: Podio, title: 'Clasificación - Triatlón' },
  { path: 'participantes', component: Participantes, title: 'Participantes - Triatlón' },
  { path: 'resultados-2024', component: Resultados2024, title: 'Resultados 2024 - Triatlón' },
  { path: 'equipo/:id', component: EquipoDetalle, title: 'Detalle de Equipo - Triatlón' },
  { path: 'premios-individuales', component: PremiosIndividuales, title: 'Premios Individuales - Triatlón' },
  { path: 'resultados/:disciplina', component: ResultadosDisciplina, title: 'Resultados por Disciplina - Triatlón' },
  { path: 'acercade', component: EquipoTrabajo, title: 'Acerca de - Triatlón' },
  {path: 'inscripcion', component: FormularioInscripcion, title: 'Inscripción de Equipos - Triatlón'},
  // Rutas de administración
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [AdminGuard],
    title: 'Admin Dashboard - Triatlón',
    children: [
      { path: 'editar-equipo/:id', component: EditarEquipo, title: 'Editar Equipo - Admin' },
      { path: 'gestion-tiempos', component: GestionTiempos, title: 'Gestión de Tiempos - Admin' },
      { path: 'gestion-equipos', component: GestionEquipos, title: 'Gestión de Equipos - Admin' },
      { path: 'gestion-solicitudes', component: GestionSolicitudes, title: 'Gestión de Solicitudes - Admin' },
      { path: 'gestion-imagenes', component: GestionImagenes, title: 'Gestión de Imágenes - Admin' },
      { path: 'gestion-noticias', component: GestionNoticias, title: 'Gestión de Noticias - Admin' },
      { path: 'visibilidad-resultados', component: VisibilidadResultados, title: 'Visibilidad de Resultados - Admin' },
      { path: '', redirectTo: 'gestion-tiempos', pathMatch: 'full' }
    ]
  },

  // Ruta de login (para admin)
  { path: 'login', component: Login, title: 'Login - Triatlón' },

  // Redirección para rutas no encontradas
  { path: '**', redirectTo: '', pathMatch: 'full' }
];