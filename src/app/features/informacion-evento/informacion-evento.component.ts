import { Component, ChangeDetectionStrategy, signal, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Disciplina } from '../../interfaces/disciplina.interface';

@Component({
  selector: 'app-informacion-evento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informacion-evento.component.html',
  styleUrls: ['./informacion-evento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformacionEventoComponent {
  private stravaScriptLoaded = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}
  disciplinas = signal<Disciplina[]>([
    {
      nombre: 'Natación',
      reglamento:
        '◉ Primer segmento del triatlón - El más técnico\n\n▸ DATOS BÁSICOS\n• Distancia: 400 metros (16 piscinas de 25 m)\n• Hora: 7:00 AM\n• Lugar: Piscina Curi - Secretaría del Deporte\n\n▸ INGRESO\n• Costo: $6,000 pesos\n• Pago: Código QR con Nequi o Daviplata\n• Llevar: Sandalias y toalla\n\n▸ EQUIPO OBLIGATORIO\n• Gorro de natación ✓\n• Gafas de natación\n• Vestido enterizo (mujeres) o pantaloneta de natación (hombres)\n\n▸ PROHIBIDO\n• Pantalonetas de fútbol o baloncesto\n• Aletas o snorkel',
      reglas:
        '▸ SALIDA\n• Desde partidor, borde o dentro del agua\n• Ida y vuelta = 50 m\n\n▸ TÉCNICA\n• Cualquier estilo permitido\n• Puedes caminar o correr por el fondo\n• Obligatorio tocar la pared (mano o pie)\n\n▸ DESCANSO\n• Puedes detenerte o flotar\n• No tomar impulso del fondo\n\n▸ CONTACTO\n• Accidental: No se sanciona\n• Intencional: Descalificación\n• Obstaculizar: Penalización',
      infoAdicional:
        '▸ PENALIZACIONES\n• No presentarse tras 3 llamados al equipo\n• Abandono o retiro: +5 minutos al último tiempo registrado\n\n▸ EMERGENCIAS\n• Levantar un brazo para recibir atención inmediata\n• Personal de seguridad estará presente\n\n▸ CONDUCTA DEPORTIVA\n• Mantener deportividad en todo momento\n• Contacto físico intencional: Descalificación\n• No se permite ayuda externa\n\n▸ RECOMENDACIONES\n• Llegar 30 minutos antes\n• Hidrátate adecuadamente\n• Calienta antes de la prueba',
      mapaUrl: 'assets/maps/natacion.png',
    },
    {
      nombre: 'Ciclismo',
      reglamento:
        '◉ Segundo segmento del triatlón\n\n▸ DATOS BÁSICOS\n• Distancia: 21 Km (14 vueltas)\n• Hora: 10:00 AM\n• Revisión de bicicletas, asignación de juez y entrega de números\n\n▸ EQUIPO OBLIGATORIO\n• Casco rígido ✓\n• Número de competencia visible\n• Atuendo apropiado y cómodo\n• Preferiblemente tener bicicleta de reemplazo\n\n▸ CONDICIONES DE LA BICICLETA\n• Frenos en óptimas condiciones\n• Suspensión funcional\n• Llantas en buen estado\n• Lubricación de partes mecánicas',
      reglas:
        '▸ DURANTE LA PRUEBA\n• No bloquear a otros competidores\n• No desviarse o tomar atajos de la ruta\n• Respetar las zonas de avituallamiento\n• Mantener el número de competencia visible\n\n▸ HIDRATACIÓN\n• Llevar hidratación propia\n• La organización brindará puntos de avituallamiento\n\n▸ RUTA\n• Completar el recorrido establecido\n• Salirse de la ruta: Eliminación de la competencia',
      infoAdicional:
        '▸ PENALIZACIONES\n• No presentarse tras 3 llamados al equipo\n• Abandono o retiro: +5 minutos al último tiempo registrado\n• Salirse de la ruta establecida: Descalificación\n\n▸ SEGURIDAD\n• Uso obligatorio de casco en todo momento\n• Bicicleta en condiciones mecánicas óptimas\n• Respetar señalización del recorrido\n\n▸ RECOMENDACIONES\n• Llegar temprano para revisión técnica\n• Verificar estado de la bicicleta antes de la prueba\n• Llevar herramientas básicas de reparación\n• Hidratarse constantemente',
      mapaUrl: 'assets/maps/mapa.png',
    },
    {
      nombre: 'Atletismo',
      reglamento:
        '◉ Tercer y último segmento del triatlón\n\n▸ DATOS BÁSICOS\n• Distancia: 4.5 Km\n• Hora: Después de ciclismo\n• Lugar: Instalaciones UPTC Sogamoso\n• Punto de partida = Punto de llegada\n\n▸ EQUIPO RECOMENDADO\n• Ropa cómoda para correr\n• Gorra\n• Bloqueador solar\n• Dorsal visible en la parte delantera ✓\n\n▸ PROHIBICIONES\n• No ser reemplazado durante la competencia\n• No tirar basura en el recorrido',
      reglas:
        '▸ MODALIDAD\n• Se permite tanto correr como caminar\n• Completar el recorrido establecido sin atajos\n• Mantener conducta deportiva en todo momento\n\n▸ LLEGADA A LA META\n• Se considera finalizada cuando el torso cruza la línea\n• No cuenta: cabeza, cuello, hombros, brazos, caderas o piernas\n• Solo el torso determina el tiempo oficial\n\n▸ RECORRIDO\n• Seguir la ruta establecida\n• No tomar atajos\n• Respetar señalización',
      infoAdicional:
        '▸ PENALIZACIONES\n• No presentarse tras 3 llamados al equipo\n• Abandono o retiro: +5 minutos al último tiempo registrado\n• Ser reemplazado: Descalificación del equipo\n\n▸ CONDUCTA DEPORTIVA\n• Competición limpia e igualitaria\n• Mantener deportividad en todo momento\n• Respetar a otros competidores\n• No tirar basura en el recorrido\n\n▸ RECOMENDACIONES\n• Usar bloqueador solar\n• Hidratarse durante el recorrido\n• Llevar gorra para protección\n• Calentar antes de iniciar',
      mapaUrl: 'assets/maps/mapa.png',
    },
  ]);

  selectedDiscipline = signal<Disciplina | null>(null);

  selectDiscipline(disciplina: Disciplina) {
    // Si el modal está abierto, solo cambia la disciplina sin cerrar
    // Si el modal está cerrado, abre con la disciplina seleccionada
    this.selectedDiscipline.set(disciplina);
    
    // Cargar script de Strava si es Atletismo o Ciclismo
    if ((disciplina.nombre === 'Atletismo' || disciplina.nombre === 'Ciclismo') && !this.stravaScriptLoaded) {
      this.loadStravaScript();
    }
  }
  
  private loadStravaScript() {
    if (this.stravaScriptLoaded) return;
    
    const script = this.renderer.createElement('script');
    script.src = 'https://strava-embeds.com/embed.js';
    script.async = true;
    script.onload = () => {
      this.stravaScriptLoaded = true;
    };
    this.renderer.appendChild(this.document.body, script);
  }

  closeDetail() {
    this.selectedDiscipline.set(null);
  }

  verResultadosAnteriores() {
    window.open(
      'https://computadoresparaeducar-my.sharepoint.com/:x:/g/personal/10ap00000006_educacioncpe_gov_co/Eac3M4vYHZBLts0zQ_t_Yp0B-qRpWKJZbhnRUH0TOQrWdA?e=HlEwPQ',
      '_blank'
    );
  }
}
