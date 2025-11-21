import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Podio } from './podio';

describe('Podio', () => {
  let component: Podio;
  let fixture: ComponentFixture<Podio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Podio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Podio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
