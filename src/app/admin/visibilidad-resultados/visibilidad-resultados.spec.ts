import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisibilidadResultados } from './visibilidad-resultados';

describe('VisibilidadResultados', () => {
  let component: VisibilidadResultados;
  let fixture: ComponentFixture<VisibilidadResultados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisibilidadResultados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisibilidadResultados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
