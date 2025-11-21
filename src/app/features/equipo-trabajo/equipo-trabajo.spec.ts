import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoTrabajo } from './equipo-trabajo';

describe('EquipoTrabajo', () => {
  let component: EquipoTrabajo;
  let fixture: ComponentFixture<EquipoTrabajo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoTrabajo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipoTrabajo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
