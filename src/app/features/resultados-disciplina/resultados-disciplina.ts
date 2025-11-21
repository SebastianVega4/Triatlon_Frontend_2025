import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ResultadosService } from '../../services/resultados';
import { Loading } from '../../components/loading/loading';
import { combineLatest } from 'rxjs';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resultados-disciplina',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink],
  templateUrl: './resultados-disciplina.html',
  styleUrls: ['./resultados-disciplina.scss']
})
export class ResultadosDisciplina implements OnInit {
  disciplina: string = '';
  disciplinaFormateada: string = '';
  resultados: any[] = [];
  loading = true;
  resultadosVisibles = true;

  constructor(
    private route: ActivatedRoute,
    private resultadosService: ResultadosService
  ) {}

  ngOnInit(): void {
    this.disciplina = this.route.snapshot.paramMap.get('disciplina') || '';
    this.disciplinaFormateada = this.formatearDisciplina(this.disciplina);
    combineLatest([
      this.resultadosService.getResultadosPorDisciplina(this.disciplina).pipe(
        map(resultados => {
          // Separar participantes con tiempo 0 y con tiempo registrado
          const conTiempo = resultados.filter(r => r.tiempo && r.tiempo !== '00:00:00');
          const sinTiempo = resultados.filter(r => !r.tiempo || r.tiempo === '00:00:00');
          
          // Ordenar los que tienen tiempo
          const ordenados = conTiempo.sort((a, b) => {
            return this.compararTiempos(a.tiempo || '99:59:59', b.tiempo || '99:59:59');
          });
          
          // Agregar los sin tiempo al final
          return [...ordenados, ...sinTiempo];
        })
      ),
      this.resultadosService.getVisibilidadResultados()
    ]).subscribe(([resultados, visibles]) => {
      this.resultados = resultados;
      this.resultadosVisibles = visibles;
      this.loading = false;
    });
  }

  private compararTiempos(tiempoA: string, tiempoB: string): number {
    const parseTime = (time: string) => {
      if (!time || time === '00:00:00') return Infinity; // Tratar tiempos no registrados como infinito
      
      const [hms, ms] = time.split('.');
      const [hh, mm, ss] = hms.split(':').map(Number);
      const milliseconds = ms ? Number(ms) : 0;
      return (hh * 3600 + mm * 60 + ss) * 1000 + milliseconds;
    };

    return parseTime(tiempoA) - parseTime(tiempoB);
  }

  private formatearDisciplina(disciplina: string): string {
    const nombres: { [key: string]: string } = {
      'natacion': 'Natación',
      'ciclismo': 'Ciclismo',
      'atletismo': 'Atletismo'
    };
    return nombres[disciplina.toLowerCase()] || disciplina;
  }
}