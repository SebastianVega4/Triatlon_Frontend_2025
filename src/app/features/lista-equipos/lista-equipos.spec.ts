import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEquipos } from './lista-equipos';

describe('ListaEquipos', () => {
  let component: ListaEquipos;
  let fixture: ComponentFixture<ListaEquipos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaEquipos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaEquipos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
