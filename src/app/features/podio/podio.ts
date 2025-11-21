import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquiposService } from '../../services/equipos';
import { ResultadosService } from '../../services/resultados';
import { map } from 'rxjs/operators';
import { Loading } from '../../components/loading/loading';
import { Equipo } from '../../interfaces/equipo';
import { RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-podio',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink],
  templateUrl: './podio.html',
  styleUrls: ['./podio.scss']
})
export class Podio implements OnInit {
  //  CONFIGURACIÓN: Cambiar a true para mostrar los resultados reales
  mostrarResultados = false; //  Cambiar a true el día de la competencia
  
  podio: Equipo[] = [];
  otrosEquipos: Equipo[] = [];
  loading = true;
  resultadosVisibles = true;

  constructor(
    private equiposService: EquiposService,
    private resultadosService: ResultadosService
  ) { }

  ngOnInit(): void {
    if (this.mostrarResultados) {
      // Cargar resultados reales
      combineLatest([
        this.equiposService.getEquipos().pipe(
          map(equipos => {
            const equiposOrdenados = equipos
              .filter(e => e.posicion)
              .sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
            
            return {
              podio: equiposOrdenados.filter(e => e.posicion && e.posicion <= 3),
              otros: equiposOrdenados.filter(e => e.posicion && e.posicion > 3)
            };
          })),
        this.resultadosService.getVisibilidadResultados()
      ]).subscribe(([{podio, otros}, visibles]) => {
        this.podio = podio;
        this.otrosEquipos = otros;
        this.resultadosVisibles = visibles;
        this.loading = false;
      });
    } else {
      // Mostrar página provisional
      this.loading = false;
    }
  }
}