import {Injectable} from '@angular/core';
import Map from "ol/Map";
import View from "ol/View";
import {fromLonLat, transformExtent} from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {GeoJSON} from "ol/format";
import VectorSource from "ol/source/Vector";
import {Vector} from "ol/layer";
import {Fill, Stroke, Style} from "ol/style";
import {Feature as TurfFeature} from "@turf/helpers/dist/js/lib/geojson";
import {MultiPolygon, Point, Polygon} from "@turf/turf";
import {Feature} from "ol";
import {Circle} from "ol/geom";
import {Observable, of} from "rxjs";
import {TurfService} from "./turf.service";
import {ScaleLine, defaults} from "ol/control";
import {IWorkerCallbacks} from "../main-page/map-page/calculator/calculator.component";


@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map!: Map;
  private worker!: Worker;

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

  addGeometryLayer(geoJsonObject: any): Observable<void> {
    return new Observable((observer) => {
      const geojsonFormat = new GeoJSON();
      const vectorSource = new VectorSource();
      const features = geojsonFormat.readFeatures(geoJsonObject, {
        featureProjection: 'EPSG:3857',
      });
      vectorSource.addFeatures(features)
      const layer = new Vector({
        source: vectorSource,
        style: [
          new Style({
            stroke: new Stroke({color: 'blue', width: 3}),
            fill: new Fill({color: 'rgba(0, 0, 255, 0.1)'})
          })
        ]
      });
      this.map.addLayer(layer);
      observer.next();
      observer.complete();
    });
  }

  addCircles(polygon: TurfFeature<(Polygon | MultiPolygon)>, num: number, radius: number, workerCallBacks: any): Observable<void> {
    const vectorSource = new VectorSource();
    const layer = new Vector({source: vectorSource,});
    this.map.addLayer(layer);
    return of(this.addCirclesToVector(vectorSource, polygon, num, radius, workerCallBacks))
  }

  private addCirclesToVector(vectorSource:VectorSource, polygon: TurfFeature<(Polygon | MultiPolygon)>, num: number, radius: number, workerCallBacks: IWorkerCallbacks) {
    this.worker = this.randomPointsWorker();
    this.worker.onmessage = ({ data }) => {
      if(data.isComplete){
        this.putPoints(vectorSource, data.result, radius);
        workerCallBacks.onComplete();
      } else {
        workerCallBacks.onProgress(data.result);
      }
    };
    this.worker.onerror = ( e ) => {
      workerCallBacks.onError(e);
    };
    this.worker.postMessage({
      num: num,
      polygon: polygon
    });
  }

  private putPoints(vectorSource:VectorSource, points: TurfFeature<Point>[], radius: number,) {
    const style = this.radialGradientStylre()
    const circleFeatures: Feature<Circle>[] = []
    for (let i = 0; i < points.length; i++) {
      let coord = points[i].geometry.coordinates;
      const circleFeature = new Feature(new Circle(fromLonLat(coord, 'EPSG:3857'), radius));
      circleFeature.setStyle(style);
      circleFeatures.push(circleFeature)
    }
    vectorSource.addFeatures(circleFeatures);
  }


  setViewOnGeoJson(geoJsonObject: any): Observable<void> {
    return new Observable((observer) => {
      const bbox = this.turfService.bbox(geoJsonObject)
      this.map.getView().fit(transformExtent(bbox, 'EPSG:4326', this.map.getView().getProjection()), {size: this.map.getSize()});
      observer.next();
      observer.complete();
    });
  }

  radialGradientStylre(): Style {
    return new Style({
      renderer(coordinates: any, state: any) {
        const [[x, y], [x1, y1]] = coordinates;
        const ctx = state.context;
        const dx = x1 - x;
        const dy = y1 - y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        const innerRadius = 0;
        const outerRadius = radius * 1.4;

        const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
        gradient.addColorStop(0, 'rgba(255,0,0, 0.7)');
        gradient.addColorStop(0.5, 'rgba(255,115,0, 0.7)');
        gradient.addColorStop(0.6, 'rgba(0,157,255, 0.5)');
        gradient.addColorStop(0.7, 'rgba(255,255,255, 0.3)');
        gradient.addColorStop(1, 'rgba(255,255,255, 0.1)');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = gradient;
        ctx.fill();

        // ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
        // ctx.strokeStyle = 'rgb(0,0,190)';
        // ctx.stroke();
      },
    })
  }

  randomPointsWorker(): Worker {
    return new Worker(new URL('./workers/random-points.worker', import.meta.url));
  }

  terminateRandomPointsWorker(): void {
    if(this.worker){
      this.worker.terminate()
    }
  }

  getMap(): Map {
    return this.map;
  }

}
