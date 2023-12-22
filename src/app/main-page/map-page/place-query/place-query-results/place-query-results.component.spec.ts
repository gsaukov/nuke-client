import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceQueryResultsComponent } from './place-query-results.component';

describe('PlaceQueryResultsComponent', () => {
  let component: PlaceQueryResultsComponent;
  let fixture: ComponentFixture<PlaceQueryResultsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlaceQueryResultsComponent]
    });
    fixture = TestBed.createComponent(PlaceQueryResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
