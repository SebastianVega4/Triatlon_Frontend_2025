import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionTiempos } from './gestion-tiempos';

describe('GestionTiempos', () => {
  let component: GestionTiempos;
  let fixture: ComponentFixture<GestionTiempos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionTiempos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionTiempos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
