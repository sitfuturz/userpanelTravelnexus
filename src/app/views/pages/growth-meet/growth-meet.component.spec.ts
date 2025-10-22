import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowthMeetComponent } from './growth-meet.component';

describe('GrowthMeetComponent', () => {
  let component: GrowthMeetComponent;
  let fixture: ComponentFixture<GrowthMeetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrowthMeetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrowthMeetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
