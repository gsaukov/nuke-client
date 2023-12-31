import {Component, Input} from '@angular/core';
import {NominatimResult} from "../../../../services/nominatim.service";
import {OverpassService} from "../../../../services/overpass.service";
import {mergeMap, of} from "rxjs";
import * as osm2geojson from "osm2geojson-lite";
import {MapService} from "../../../../services/map.service";

@Component({
  selector: 'app-place-query-results',
  templateUrl: './place-query-results.component.html',
  styleUrls: ['./place-query-results.component.css']
})
export class PlaceQueryResultsComponent {
  private _dataSource!: NominatimResult[]
  columnsToDisplay = ['#', 'display_name', 'addresstype', 'osm_id', ]

  constructor(private overpassService: OverpassService, private mapService: MapService) { }

  @Input()
  set dataSource(dataSource: NominatimResult[]) {
    this._dataSource = dataSource;
  }

  get dataSource(): any {
    return this._dataSource;
  }

  selectPlace(row:NominatimResult) {
    const countryId = OverpassService.getOverpassCountryId(row.osm_id)
    this.overpassService.getGeometryData(countryId).pipe(
      mergeMap(overpassRes => of(osm2geojson(overpassRes, {completeFeature: true}))),
      mergeMap(geoJsonObject => this.mapService.addGeometryLayer(geoJsonObject))
    ).subscribe()
  }
}
