import {Feature, MultiPolygon, Point, Polygon} from "@turf/turf";
import * as turf from "@turf/turf";

export function recursiveRandomPointInPolygon(polygon: Feature<(Polygon | MultiPolygon)>, depth: number = 500): Feature<Point> {
  //bbox extent in minX, minY, maxX, maxY order
  if(depth <= 0) {
    throw new Error('Random point calculation recursion depth limit reached')
  }
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
    return recursiveRandomPointInPolygon(polygon, depth-1)
  }
}
