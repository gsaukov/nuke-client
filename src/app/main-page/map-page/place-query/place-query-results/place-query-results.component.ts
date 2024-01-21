import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NominatimResult} from "../../../../services/nominatim.service";
import {ILayerID, LayersService} from "../../../../services/layers.service";
import {FeatureCollection} from "@turf/helpers/dist/js/lib/geojson";
import {ActivatedRoute, Router} from "@angular/router";
import {GeojsonFlowService} from "../../../../services/geojson-flow.service";
import {EMPTY, Observable} from 'rxjs';

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

  constructor(private flowService: GeojsonFlowService, private layersService: LayersService, private router:Router, private route: ActivatedRoute) { }

  @Input()
  set dataSource(dataSource: NominatimResult[]) {
    this._dataSource = dataSource;
  }

  get dataSource(): any {
    return this._dataSource;
  }

  previewPlace(row:NominatimResult): Observable<void> {
    if(!this.isSameLayer(row)){
      this.removePreviewLayer()
      this.flowService.previewPlace(row).subscribe(
        responses => {
          this.previewPlaceLayerId = responses[0]
          this.previewGeoJson = responses[1]
          return EMPTY
        }
      )
    }
    return EMPTY
  }

  selectPlace(row:NominatimResult) {
    if(this.isSameLayer(row)){
      this.redirectToEvents()
    } else {
      this.previewPlace(row).subscribe(
        () => this.redirectToEvents()
      )
    }
  }

  private redirectToEvents() {
    this.redirect.emit(this.previewGeoJson);
    this.router.navigate(["events"], { relativeTo: this.route });
  }

  private isSameLayer(row:NominatimResult):boolean {
    return Boolean(this.previewPlaceLayerId && this.previewPlaceLayerId.geoJsonId.indexOf(row.osm_id.toString()) > 0)
  }

  private removePreviewLayer() {
    this.layersService.removeLayer(this.previewPlaceLayerId)
  }

}
