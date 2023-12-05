import {Injectable} from "@angular/core";
import {Feature, MultiPolygon, Polygon} from "@turf/turf";

@Injectable({
  providedIn: 'root'
})
export class FactorialService {
  factorialResult!: any;

  constructor() {
  }

  calculateFactorial(num: number, polygon: Feature<(Polygon | MultiPolygon)>) {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('./workers/random-points.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        this.factorialResult = data;
        console.log("Points from worker:" + JSON.stringify( data))
      };
      worker.postMessage({
        num: num,
        polygon: polygon
      });
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }
}
