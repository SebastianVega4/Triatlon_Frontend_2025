import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioInscripcion } from './formulario-inscripcion';

describe('FormularioInscripcion', () => {
  let component: FormularioInscripcion;
  let fixture: ComponentFixture<FormularioInscripcion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioInscripcion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioInscripcion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
