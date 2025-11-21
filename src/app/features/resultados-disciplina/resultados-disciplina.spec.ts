import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosDisciplina } from './resultados-disciplina';

describe('ResultadosDisciplina', () => {
  let component: ResultadosDisciplina;
  let fixture: ComponentFixture<ResultadosDisciplina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosDisciplina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadosDisciplina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
