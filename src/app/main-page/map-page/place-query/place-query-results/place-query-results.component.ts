import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NominatimResult} from "../../../../services/nominatim.service";
import {OverpassService} from "../../../../services/overpass.service";
import {mergeMap, Observable, of, zip} from "rxjs";
import {MapService} from "../../../../services/map.service";
import {ILayerID, LayersService} from "../../../../services/layers.service";
import {Osm2GeojsonService} from "../../../../services/osm2seojson.service";
import {FeatureCollection} from "@turf/helpers/dist/js/lib/geojson";
import {Router} from "@angular/router";

@Component({
  selector: 'app-place-query-results',
  templateUrl: './place-query-results.component.html',
  styleUrls: ['./place-query-results.component.css']
})
export class PlaceQueryResultsComponent {
  private _dataSource!: NominatimResult[]
  private previewPlaceLayerId!: ILayerID
  private previewGeoJson!: FeatureCollection
  columnsToDisplay = ['#', 'display_name', 'addresstype', 'osm_id', 'placeSelector']

  @Output() redirect:EventEmitter<FeatureCollection> = new EventEmitter();

  constructor(private overpassService: OverpassService, private mapService: MapService, private layersService: LayersService, private osm2GeojsonService: Osm2GeojsonService, private router:Router) { }

  @Input()
  set dataSource(dataSource: NominatimResult[]) {
    this._dataSource = dataSource;
  }

  get dataSource(): any {
    return this._dataSource;
  }

  previewPlace(row:NominatimResult) {
    if(this.previewPlaceLayerId){
      this.removePreviewLayer()
    }
    this.getOverpassData(row).pipe(
      mergeMap(overpassRes => of(this.osm2GeojsonService.convert(overpassRes))),
      mergeMap(geoJsonObject => {
        this.previewGeoJson = geoJsonObject
        return zip(
          this.layersService.addGeoJsonLayer(geoJsonObject),
          this.mapService.setViewOnGeoJson(geoJsonObject)
        );
      })
    ).subscribe(
      responses => {
        this.previewPlaceLayerId = responses[0]
      }
    )
  }

  selectPlace(row:NominatimResult) {
    if(this.previewPlaceLayerId && this.previewPlaceLayerId.geoJsonId.indexOf(row.osm_id.toString()) > 0){
      this.redirect.emit(this.previewGeoJson);
      this.router.navigate(["url"]);
    } else {
      this.previewPlace(row)
    }
  }

  private getOverpassData(data: NominatimResult): Observable<any> {
    switch (data.osm_type) {
      case 'node':
        return this.overpassService.getNodeGeometryData(data.osm_id);
      case 'way':
        return this.overpassService.getWayGeometryData(data.osm_id);
      case 'relation':
        return this.overpassService.getRelationGeometryData(data.osm_id);
      default:
        return this.overpassService.getRelationGeometryData(data.osm_id);
    }
  }

  private removePreviewLayer() {
    this.layersService.removeLayer(this.previewPlaceLayerId)
  }

}
