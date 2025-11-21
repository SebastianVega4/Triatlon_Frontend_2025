import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EquiposService } from '../../services/equipos';
import { Loading } from '../../components/loading/loading';
import { ResultadosService } from '../../services/resultados';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-equipo-detalle',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink],
  templateUrl: './equipo-detalle.html',
  styleUrls: ['./equipo-detalle.scss']
})
export class EquipoDetalle implements OnInit {
  equipo: any = null;
  participantes: any[] = [];
  loading = true;
  resultadosVisibles = true;

  constructor(
    private route: ActivatedRoute,
    private equiposService: EquiposService,
    private resultadosService: ResultadosService
  ) {}

  ngOnInit(): void {
    const equipoId = this.route.snapshot.paramMap.get('id');
    if (equipoId) {
      this.equiposService.getEquipo(equipoId).subscribe(equipo => {
        this.equipo = equipo;
        this.equiposService.getParticipantes(equipoId).subscribe(participantes => {
          this.participantes = participantes;
          
          this.resultadosService.getVisibilidadResultados().subscribe(visibles => {
            this.resultadosVisibles = visibles;
            this.loading = false;
          });
        });
      });
    }
  }

  getDisciplinaPenalizacion(disciplina: string): string {
    if (!this.equipo) return '';
    
    switch(disciplina) {
      case 'natacion':
        return this.equipo.penalizacion_natacion ? 'Natación' : '';
      case 'ciclismo':
        return this.equipo.penalizacion_ciclismo ? 'Ciclismo' : '';
      case 'atletismo':
        return this.equipo.penalizacion_atletismo ? 'Atletismo' : '';
      default:
        return '';
    }
  }
}