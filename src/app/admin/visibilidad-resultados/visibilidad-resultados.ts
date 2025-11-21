import { Component, OnInit } from '@angular/core';
import { ResultadosService } from '../../services/resultados';
import { CommonModule } from '@angular/common';
import { VisibilidadResultados as VisibilidadResultadosInterface } from '../../services/resultados'; // Add this import

@Component({
  selector: 'app-visibilidad-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visibilidad-resultados.html',
  styleUrls: ['./visibilidad-resultados.scss']
})
export class VisibilidadResultados implements OnInit {
  resultadosVisibles = false;
  loading = false;

  constructor(private resultadosService: ResultadosService) {}

  ngOnInit(): void {
    this.resultadosService.getVisibilidad().subscribe((response: VisibilidadResultadosInterface) => {
      this.resultadosVisibles = response.resultados_visibles;
    });
  }

  toggleVisibilidad(): void {
    this.loading = true;
    this.resultadosService.toggleVisibilidad(!this.resultadosVisibles)
      .subscribe({
        next: (response: VisibilidadResultadosInterface) => {
          this.resultadosVisibles = response.resultados_visibles;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error cambiando visibilidad:', error);
          this.loading = false;
        }
      });
  }
}