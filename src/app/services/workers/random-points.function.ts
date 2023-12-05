import {Feature, MultiPolygon, Point, Polygon} from "@turf/turf";
import {TurfService} from "../turf.service";

export function randomPointsInPolygon(num: number, polygon: Feature<(Polygon | MultiPolygon)>): Feature<Point>[] {
  const points: Feature<Point>[] = []
  for(let i = 0; i < num; i++ ) {
    points[i] = TurfService.recursiveRandomPointInPolygon(polygon)
  }
  return points
}
