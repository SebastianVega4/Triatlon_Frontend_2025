import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Participantes } from './participantes';

describe('Participantes', () => {
  let component: Participantes;
  let fixture: ComponentFixture<Participantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Participantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Participantes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
