import { TestBed } from '@angular/core/testing';

import { Resultados } from './resultados';

describe('Resultados', () => {
  let service: Resultados;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Resultados);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
