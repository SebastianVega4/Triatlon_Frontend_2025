import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EquiposService } from '../../services/equipos';
import { ResultadosService } from '../../services/resultados';
import { combineLatest } from 'rxjs';
import { Loading } from '../../components/loading/loading';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-equipos',
  standalone: true,
  imports: [CommonModule, RouterLink, Loading, FormsModule],
  templateUrl: './lista-equipos.html',
  styleUrls: ['./lista-equipos.scss']
})
export class ListaEquipos implements OnInit {
  equipos: any[] = [];
  equiposFiltrados: any[] = []; // Nueva propiedad para equipos filtrados
  resultadosVisibles = true;
  loading = true;
  terminoBusqueda: string = ''; // Variable para el término de búsqueda

  constructor(
    private equiposService: EquiposService,
    private resultadosService: ResultadosService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.equiposService.getEquipos(),
      this.resultadosService.getVisibilidadResultados()
    ]).subscribe(([equipos, visibles]) => {
      this.equipos = equipos;
      this.equiposFiltrados = [...equipos]; // Inicializar con todos los equipos
      this.resultadosVisibles = visibles;
      this.loading = false;
    });
  }

  // Método para filtrar equipos
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

  getClasePosicion(posicion: number): string {
    if (posicion === 1) return 'gold';
    if (posicion === 2) return 'silver';
    if (posicion === 3) return 'bronze';
    return '';
  }
}