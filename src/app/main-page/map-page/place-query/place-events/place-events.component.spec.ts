import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceEventsComponent } from './place-events.component';

describe('PlaceEventsComponent', () => {
  let component: PlaceEventsComponent;
  let fixture: ComponentFixture<PlaceEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlaceEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
