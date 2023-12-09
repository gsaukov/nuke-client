import {Injectable} from '@angular/core';
import * as turf from '@turf/turf';
import { BBox } from "@turf/helpers";
import {Feature, MultiPolygon, Polygon, Point} from "@turf/turf";
import {Observable, of} from "rxjs";
import {recursiveRandomPointInPolygon} from "./random-point-in-polygon.function";

@Injectable({
  providedIn: 'root'
})
export class TurfService {

  constructor() {
  }

  public randomPointsInPolygon(num: number, polygon: Feature<(Polygon | MultiPolygon)>): Feature<Point>[] {
    const points: Feature<Point>[] = []
    for(let i = 0; i < num; i++ ) {
      points[i] = recursiveRandomPointInPolygon(polygon)
    }
    return points
  }

  public randomPointInPolygon(polygon: Feature<(Polygon | MultiPolygon)>): Observable<Feature<Point>> {
    return of(recursiveRandomPointInPolygon(polygon));
  }

  public bbox(geojson: any): BBox {
    return turf.bbox(geojson);
  }

  public area(polygon: any): number {
    return turf.area(turf.polygon(polygon));
  }

}
