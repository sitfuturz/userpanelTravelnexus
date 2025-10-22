import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GratitudeComponent } from './gratitude.component';

describe('GratitudeComponent', () => {
  let component: GratitudeComponent;
  let fixture: ComponentFixture<GratitudeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GratitudeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GratitudeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
