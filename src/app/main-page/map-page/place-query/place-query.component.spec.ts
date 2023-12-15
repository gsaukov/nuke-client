import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceQueryComponent } from './place-query.component';

describe('PlaceQueryComponent', () => {
  let component: PlaceQueryComponent;
  let fixture: ComponentFixture<PlaceQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlaceQueryComponent]
    });
    fixture = TestBed.createComponent(PlaceQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
