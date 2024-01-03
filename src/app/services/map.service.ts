import {Injectable} from '@angular/core';
import Map from "ol/Map";
import View from "ol/View";
import {fromLonLat, transformExtent} from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {Observable, of} from "rxjs";
import {TurfService} from "./turf.service";
import {ScaleLine, defaults} from "ol/control";
import {IWorkerCallbacks} from "../main-page/map-page/calculator/calculator.component";


@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map!: Map;

  constructor(private turfService: TurfService) {
  }

  buildMap(): Observable<Map> {
    return new Observable((observer) => {
      const map = new Map({
        controls: defaults().extend([new ScaleLine({
          units: 'metric',
        })]),
        view: new View({
          center: fromLonLat([69.2787079, 41.3123363], 'EPSG:3857'),
          zoom: 12,
        }),
        layers: [
          new TileLayer({
            source: new OSM({
              attributions: '<a href="https://gsaukov.netlify.app/" target="_blank" style="color:blue;">Georgy Saukov</a> &copy; ' +
                '<a href="https://www.openstreetmap.org/copyright" target="_blank" style="color:blue;">OpenStreetMap</a> contributors',
            }),
          }),
        ],
        target: 'ol-map',
      });
      observer.next(this.map = map);
      observer.complete();
    });
  }

  setViewOnGeoJson(geoJsonObject: any): Observable<void> {
    return new Observable((observer) => {
      const bbox = this.turfService.bbox(geoJsonObject)
      this.map.getView().fit(transformExtent(bbox, 'EPSG:4326', this.map.getView().getProjection()), {size: this.map.getSize()});
      observer.next();
      observer.complete();
    });
  }

  getMap(): Map {
    return this.map;
  }

}
