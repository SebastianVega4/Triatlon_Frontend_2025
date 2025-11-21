import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EquiposService } from '../../services/equipos';
import { CommonModule } from '@angular/common';
import { Loading } from '../../components/loading/loading';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-equipo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Loading, FormsModule],
  templateUrl: './editar-equipo.html',
  styleUrls: ['./editar-equipo.scss']
})
export class EditarEquipo implements OnInit {
  equipoForm: FormGroup;
  participantes: any[] = [];
  loading = true;
  equipoId: string = '';
  disciplinas = ['natacion', 'ciclismo', 'atletismo'];

  constructor(
    private fb: FormBuilder,
    private equiposService: EquiposService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.equipoForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.equipoId = this.route.snapshot.paramMap.get('id') || '';
    
    this.equiposService.getEquipo(this.equipoId).subscribe(equipo => {
      if (equipo) {
        this.equipoForm.patchValue({
          nombre: equipo.nombre
        });
        
        this.equiposService.getParticipantes(this.equipoId).subscribe(participantes => {
          this.participantes = participantes;
          this.loading = false;
        });
      }
    });
  }

  async guardarCambios(): Promise<void> {
    if (this.equipoForm.invalid || this.participantes.length !== 3) {
      alert('Debe completar todos los campos y tener exactamente 3 participantes');
      return;
    }

    this.loading = true;
    try {
      await this.equiposService.updateEquipo(this.equipoId, this.equipoForm.value);
      
      for (const participante of this.participantes) {
        await this.equiposService.updateParticipante(
          this.equipoId,
          participante.id,
          {
            nombre: participante.nombre,
            genero: participante.genero,
            disciplina: participante.disciplina
          }
        );
      }
      
      this.router.navigate(['/admin/gestion-tiempos']);
    } catch (error) {
      console.error('Error actualizando equipo:', error);
      alert('Error actualizando equipo');
    } finally {
      this.loading = false;
    }
  }
}