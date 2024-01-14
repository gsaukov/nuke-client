import {Injectable} from '@angular/core';
import {mergeMap, Observable, of, zip} from "rxjs";
import {OverpassService} from "./overpass.service";
import {MapService} from "./map.service";
import {ILayerID, LayersService} from "./layers.service";
import {Osm2GeojsonService} from "./osm2seojson.service";
import {NominatimResult} from "./nominatim.service";
import {FeatureCollection} from "@turf/helpers/dist/js/lib/geojson";

@Injectable({
  providedIn: 'root'
})
export class GeojsonFlowService {

  constructor(private overpassService: OverpassService, private mapService: MapService, private layersService: LayersService, private osm2GeojsonService: Osm2GeojsonService) { }

  previewPlace(nominatimRes:NominatimResult): Observable<[ILayerID, FeatureCollection]> {
    return this.getOverpassData(nominatimRes).pipe(
      mergeMap(overpassRes => of(this.osm2GeojsonService.convert(overpassRes))),
      mergeMap(geoJsonObject => {
        return zip(
          this.layersService.addGeoJsonLayer(geoJsonObject),
          this.mapService.setViewOnGeoJson(geoJsonObject)
        );
      })
    )
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

}
