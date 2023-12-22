import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-place-query-results',
  templateUrl: './place-query-results.component.html',
  styleUrls: ['./place-query-results.component.css']
})
export class PlaceQueryResultsComponent {
  dataSource: any[]
  columnsToDisplay = ['#', 'placeName', 'placeId']

  constructor() {
    this.dataSource = []
    let o = {
      number: 1,
      placeName: "Usa, Shigonsky District, Samara Oblast, Volga Federal District, Russia",
      placeId: 36003427103,
    }
    this.dataSource.push(o)
  }

  ngOnInit() {
  }

}
