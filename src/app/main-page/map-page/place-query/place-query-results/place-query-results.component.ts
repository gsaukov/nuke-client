import {Component, Input} from '@angular/core';
import {NominatimResult} from "../../../../services/nominatim.service";
import {OverpassService} from "../../../../services/overpass.service";

@Component({
  selector: 'app-place-query-results',
  templateUrl: './place-query-results.component.html',
  styleUrls: ['./place-query-results.component.css']
})
export class PlaceQueryResultsComponent {
  private _dataSource!: NominatimResult[]
  columnsToDisplay = ['#', 'display_name', 'addresstype', 'osm_id', ]

  constructor(private overpassService: OverpassService) { }

  @Input()
  set dataSource(dataSource: NominatimResult[]) {
    this._dataSource = dataSource;
  }

  get dataSource(): any {
    return this._dataSource;
  }

  selectPlace(row:NominatimResult) {
    const countryId = OverpassService.getOverpassCountryId(row.osm_id)
    return this.overpassService.getGeometryData(countryId);
  }
}
