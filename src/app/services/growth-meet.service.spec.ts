import { TestBed } from '@angular/core/testing';

import { GrowthMeetService } from './growth-meet.service';

describe('GrowthMeetService', () => {
  let service: GrowthMeetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrowthMeetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
