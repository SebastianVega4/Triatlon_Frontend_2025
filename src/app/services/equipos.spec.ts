import { TestBed } from '@angular/core/testing';

import { Equipos } from './equipos';

describe('Equipos', () => {
  let service: Equipos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Equipos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
