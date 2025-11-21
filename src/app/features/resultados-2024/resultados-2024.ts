import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Loading } from '../../components/loading/loading';
import { PARTICIPANTES_2024 } from '../participantes/participantes-2024.data';

@Component({
  selector: 'app-resultados-2024',
  standalone: true,
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './resultados-2024.html',
  styleUrls: ['./resultados-2024.scss']
})
export class Resultados2024 implements OnInit {
  participantes2024: any[] = PARTICIPANTES_2024;
  participantes2024Filtrados: any[] = [];
  equiposAgrupados: any[] = [];
  terminoBusqueda: string = '';
  disciplinaFiltro: string = 'todas';
  ordenTiempo: string = 'ninguno'; // 'ninguno', 'asc', 'desc'
  ordenEquipos: string = 'asc'; // 'asc' (menor a mayor), 'desc' (mayor a menor)
  agruparPorEquipo: boolean = true;
  loading = false;

  disciplinas = [
    { valor: 'todas', nombre: 'Todas las disciplinas' },
    { valor: 'natacion', nombre: 'Natación' },
    { valor: 'ciclismo', nombre: 'Ciclismo' },
    { valor: 'atletismo', nombre: 'Atletismo' }
  ];

  urlExcelCompleto: string = 'https://computadoresparaeducar-my.sharepoint.com/:x:/g/personal/10ap00000006_educacioncpe_gov_co/Eac3M4vYHZBLts0zQ_t_Yp0B-qRpWKJZbhnRUH0TOQrWdA?e=HlEwPQ';

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = [...this.participantes2024];

    // Si está en vista por equipos y hay búsqueda, filtrar por equipos completos
    if (this.agruparPorEquipo && this.terminoBusqueda) {
      const termino = this.normalizarTexto(this.terminoBusqueda);
      
      // Encontrar equipos que coincidan con la búsqueda
      const equiposCoincidentes = new Set<string>();
      
      this.participantes2024.forEach(p => {
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

    // Filtrar por disciplina
    if (this.disciplinaFiltro !== 'todas') {
      resultado = resultado.filter(p => p.disciplina === this.disciplinaFiltro);
    }

    // Ordenar por tiempo individual si no está agrupado
    if (this.ordenTiempo !== 'ninguno' && !this.agruparPorEquipo) {
      resultado = this.ordenarPorTiempo(resultado, this.ordenTiempo);
    }

    this.participantes2024Filtrados = resultado;

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

  filtrarParticipantes(): void {
    this.aplicarFiltros();
  }

  cambiarDisciplina(): void {
    this.aplicarFiltros();
  }

  cambiarOrdenTiempo(): void {
    this.aplicarFiltros();
  }

  cambiarOrdenEquipos(): void {
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

  agruparPorEquipos(): void {
    const equiposMap = new Map<string, any>();

    this.participantes2024Filtrados.forEach(p => {
      const equipoNombre = p.equipoNombre || 'Sin equipo';
      
      if (!equiposMap.has(equipoNombre)) {
        equiposMap.set(equipoNombre, {
          nombre: equipoNombre,
          participantes: [],
          tiempoTotal: 0,
          tiempoTotalFormateado: '--:--:--',
          posicion: 0
        });
      }
      
      equiposMap.get(equipoNombre)!.participantes.push(p);
    });

    // Calcular tiempo total por equipo
    equiposMap.forEach((equipo) => {
      let tiempoTotalSegundos = 0;
      let todosConTiempo = true;

      equipo.participantes.forEach((p: any) => {
        const tiempoSegundos = this.convertirTiempoASegundos(p.tiempo);
        if (tiempoSegundos !== null) {
          tiempoTotalSegundos += tiempoSegundos;
        } else {
          todosConTiempo = false;
        }
      });

      equipo.tiempoTotal = todosConTiempo ? tiempoTotalSegundos : null;
      equipo.tiempoTotalFormateado = todosConTiempo 
        ? this.formatearSegundosATiempo(tiempoTotalSegundos)
        : '--:--:--';
    });

    // Convertir a array y ordenar por tiempo total (siempre de menor a mayor para asignar posiciones)
    const equiposOrdenados = Array.from(equiposMap.values()).sort((a, b) => {
      if (a.tiempoTotal !== null && b.tiempoTotal !== null) {
        return a.tiempoTotal - b.tiempoTotal; // Menor a mayor (más rápido primero)
      }
      if (a.tiempoTotal === null && b.tiempoTotal === null) return 0;
      if (a.tiempoTotal === null) return 1;
      if (b.tiempoTotal === null) return -1;
      return 0;
    });

    // Asignar posiciones basadas en el tiempo (más rápido = posición 1)
    equiposOrdenados.forEach((equipo, index) => {
      equipo.posicion = index + 1;
    });

    // Ahora aplicar el orden de visualización según la preferencia del usuario
    if (this.ordenEquipos === 'desc') {
      // Invertir el orden para mostrar más lentos primero, pero mantener las posiciones
      this.equiposAgrupados = [...equiposOrdenados].reverse();
    } else {
      this.equiposAgrupados = equiposOrdenados;
    }
  }

  formatearSegundosATiempo(segundosTotales: number): string {
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = Math.floor(segundosTotales % 60);

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  ordenarPorTiempo(participantes: any[], orden: string): any[] {
    return participantes.sort((a, b) => {
      const tiempoA = this.convertirTiempoASegundos(a.tiempo);
      const tiempoB = this.convertirTiempoASegundos(b.tiempo);

      // Manejar tiempos inválidos (sin tiempo registrado)
      if (tiempoA === null && tiempoB === null) return 0;
      if (tiempoA === null) return 1; // Los sin tiempo van al final
      if (tiempoB === null) return -1;

      if (orden === 'asc') {
        return tiempoA - tiempoB; // Menor a mayor
      } else {
        return tiempoB - tiempoA; // Mayor a menor
      }
    });
  }

  convertirTiempoASegundos(tiempo: string): number | null {
    if (!tiempo || tiempo === '--:--:--' || tiempo === '--:--:--.---') return null;

    // Remover espacios en blanco
    tiempo = tiempo.trim();
    
    // Formato esperado: HH:MM:SS.mmm o HH:MM:SS o MM:SS
    const partes = tiempo.split(':');
    
    try {
      if (partes.length === 3) {
        // HH:MM:SS.mmm o HH:MM:SS
        const horas = parseInt(partes[0]);
        const minutos = parseInt(partes[1]);
        
        // Separar segundos de milisegundos si existen
        const segundosParte = partes[2].split('.');
        const segundos = parseInt(segundosParte[0]);
        const milisegundos = segundosParte[1] ? parseFloat('0.' + segundosParte[1]) : 0;
        
        return horas * 3600 + minutos * 60 + segundos + milisegundos;
      } else if (partes.length === 2) {
        // MM:SS.mmm o MM:SS
        const minutos = parseInt(partes[0]);
        
        const segundosParte = partes[1].split('.');
        const segundos = parseInt(segundosParte[0]);
        const milisegundos = segundosParte[1] ? parseFloat('0.' + segundosParte[1]) : 0;
        
        return minutos * 60 + segundos + milisegundos;
      }
    } catch (error) {
      console.error('Error al convertir tiempo:', tiempo, error);
      return null;
    }

    return null;
  }

  formatearTiempo(tiempo: string): string {
    if (!tiempo || tiempo === '--:--:--' || tiempo === '--:--:--.---') {
      return '--:--:--';
    }

    // Remover espacios en blanco
    tiempo = tiempo.trim();
    
    // Formato esperado: HH:MM:SS.mmm o HH:MM:SS o MM:SS
    const partes = tiempo.split(':');
    
    try {
      if (partes.length === 3) {
        // HH:MM:SS.mmm o HH:MM:SS
        const horas = partes[0].padStart(2, '0');
        const minutos = partes[1].padStart(2, '0');
        
        // Separar segundos de milisegundos y solo tomar segundos
        const segundosParte = partes[2].split('.');
        const segundos = segundosParte[0].padStart(2, '0');
        
        return `${horas}:${minutos}:${segundos}`;
      } else if (partes.length === 2) {
        // MM:SS.mmm o MM:SS - agregar 00 para horas
        const minutos = partes[0].padStart(2, '0');
        
        const segundosParte = partes[1].split('.');
        const segundos = segundosParte[0].padStart(2, '0');
        
        return `00:${minutos}:${segundos}`;
      }
    } catch (error) {
      console.error('Error al formatear tiempo:', tiempo, error);
      return '--:--:--';
    }

    return '--:--:--';
  }

  getIconoDisciplina(disciplina: string): string {
    if (!disciplina) return 'bi-question-circle';
    
    const iconos: { [key: string]: string } = {
      'natacion': 'bi-droplet',
      'ciclismo': 'bi-bicycle',
      'atletismo': 'bi-lightning'
    };
    
    return iconos[disciplina.toLowerCase()] || 'bi-question-circle';
  }

  getNombreDisciplina(disciplina: string): string {
    if (!disciplina) return '--';
    
    const nombres: { [key: string]: string } = {
      'natacion': 'Natación',
      'ciclismo': 'Ciclismo',
      'atletismo': 'Atletismo'
    };
    
    return nombres[disciplina.toLowerCase()] || disciplina;
  }
}
