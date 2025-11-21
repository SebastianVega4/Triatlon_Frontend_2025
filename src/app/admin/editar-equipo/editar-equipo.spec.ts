import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEquipo } from './editar-equipo';

describe('EditarEquipo', () => {
  let component: EditarEquipo;
  let fixture: ComponentFixture<EditarEquipo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEquipo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEquipo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
