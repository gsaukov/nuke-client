import {Injectable} from '@angular/core';
import {Feature} from "ol";
import {Feature as TurfFeature} from "@turf/helpers/dist/js/lib/geojson";
import {MultiPolygon, Point, Polygon} from "@turf/turf";
import VectorSource from "ol/source/Vector";
import {IWorkerCallbacks} from "../main-page/map-page/calculator/calculator.component";
import {Circle} from "ol/geom";
import {fromLonLat} from "ol/proj";
import {Style} from "ol/style";


@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private worker!: Worker;

  addEventsToVector(vectorSource:VectorSource, polygon: TurfFeature<(Polygon | MultiPolygon)>, num: number, radius: number, workerCallBacks: IWorkerCallbacks) {
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
    vectorSource.addFeatures(circleFeatures)
  }

  private radialGradientStylre(): Style {
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

  private randomPointsWorker(): Worker {
    return new Worker(new URL('./workers/random-points.worker', import.meta.url));
  }

  terminateRandomPointsWorker(): void {
    if(this.worker){
      this.worker.terminate()
    }
  }

}
