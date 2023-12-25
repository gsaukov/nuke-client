import {Component, Input} from '@angular/core';
import {NominatimResult} from "../../../../services/nominatim.service";

@Component({
  selector: 'app-place-query-results',
  templateUrl: './place-query-results.component.html',
  styleUrls: ['./place-query-results.component.css']
})
export class PlaceQueryResultsComponent {
  @Input()dataSource!: NominatimResult[]
  columnsToDisplay = ['#', 'display_name', 'addresstype', 'osm_id', ]

  constructor() {
  }

  ngOnInit() {
  }

}
