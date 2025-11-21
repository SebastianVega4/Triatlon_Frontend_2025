import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiosIndividuales } from './premios-individuales';

describe('PremiosIndividuales', () => {
  let component: PremiosIndividuales;
  let fixture: ComponentFixture<PremiosIndividuales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiosIndividuales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiosIndividuales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
