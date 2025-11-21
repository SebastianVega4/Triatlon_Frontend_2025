import { TestBed } from '@angular/core/testing';

import { Participantes } from './participantes';

describe('Participantes', () => {
  let service: Participantes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Participantes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
