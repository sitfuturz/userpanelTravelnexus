import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TyfcbslipComponent } from './tyfcbslip.component';

describe('TyfcbslipComponent', () => {
  let component: TyfcbslipComponent;
  let fixture: ComponentFixture<TyfcbslipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TyfcbslipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TyfcbslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
