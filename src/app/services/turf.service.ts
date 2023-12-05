import {Injectable} from '@angular/core';
import * as turf from '@turf/turf';
import { BBox } from "@turf/helpers";
import {Feature, MultiPolygon, Polygon, Point} from "@turf/turf";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TurfService {

  constructor() {
  }

  public randomPointsInPolygon(num: number, polygon: Feature<(Polygon | MultiPolygon)>): Feature<Point>[] {
    const points: Feature<Point>[] = []
    for(let i = 0; i < num; i++ ) {
      points[i] = TurfService.recursiveRandomPointInPolygon(polygon)
    }
    return points
  }

  public randomPointInPolygon(polygon: Feature<(Polygon | MultiPolygon)>): Observable<Feature<Point>> {
    return of(TurfService.recursiveRandomPointInPolygon(polygon));
  }

  public static recursiveRandomPointInPolygon(polygon: Feature<(Polygon | MultiPolygon)>): Feature<Point> {
    //bbox extent in minX, minY, maxX, maxY order
    const bounds = turf.bbox(polygon)
    const x_min = bounds[0];
    const y_min = bounds[1];
    const x_max = bounds[2];
    const y_max = bounds[3];

    const lat = y_min + (Math.random() * (y_max - y_min));
    const lng = x_min + (Math.random() * (x_max - x_min));

    const point: Feature<Point> = turf.point([lng, lat]);
    try {
      var inside = turf.booleanPointInPolygon(point, polygon);
    } catch (e) {
      console.log(polygon)
      console.log(point)
      throw e
    }
    if (inside) {
      return point
    } else {
      return this.recursiveRandomPointInPolygon(polygon)
    }
  }

  public bbox(geojson: any): Observable<BBox> {
    return of(turf.bbox(geojson));
  }

}
