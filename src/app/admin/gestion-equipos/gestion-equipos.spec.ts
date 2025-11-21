import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEquipos } from './gestion-equipos';

describe('GestionEquipos', () => {
  let component: GestionEquipos;
  let fixture: ComponentFixture<GestionEquipos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEquipos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEquipos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
