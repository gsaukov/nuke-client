import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-place-query-results',
  templateUrl: './place-query-results.component.html',
  styleUrls: ['./place-query-results.component.css']
})
export class PlaceQueryResultsComponent {
  @Input()dataSource: any[]
  columnsToDisplay = ['#', 'placeName', 'placeId']

  constructor() {
    this.dataSource = []
    let p1 = {
      number: 1,
      placeName: "Usa, Oita Prefecture, Japan",
      placeId: 36004004810,
    }
    let p2 = {
      number: 2,
      placeName: "Usa, Shigonsky District, Samara Oblast, Volga Federal District, Russia",
      placeId: 36003427103,
    }
    let p3 = {
      number: 3,
      placeName: "Usa, Wetteraukreis, Hesse, Germany",
      placeId: 36010966429,
    }
    this.dataSource.push(p1)
    this.dataSource.push(p2)
    this.dataSource.push(p3)
  }

  ngOnInit() {
  }

}
