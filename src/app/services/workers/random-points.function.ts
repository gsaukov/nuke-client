import {Feature, MultiPolygon, Point, Polygon, Position} from "@turf/turf";
import {RandomPointsWorkerProgress} from "./random-points.worker";
import * as turf from "@turf/turf";

interface IPolygonDesc {
  polygon: Feature<Polygon>,
  area: number,
  weight: number,
}
export function randomPointsInPolygon(num: number, polygon: Feature<(Polygon | MultiPolygon)>): RandomPointsWorkerProgress {
  const points: Feature<Point>[] = []
  const describedPolygons = describePolygons(polygon);
  const length = describedPolygons.length;
  let pointsCounter = num;
  let i = 0
  for(;;) {
    const describedPolygon = describedPolygons[i];
    if(weightedChance(describedPolygon)){
      points.push(recursiveRandomPointInPolygon(describedPolygon.polygon))
      pointsCounter = pointsCounter-1;
      if (points.length % 100 == 0 || pointsCounter == 0) {
        self.postMessage({isComplete: false, message: num, result: points});
      }
      if (pointsCounter == 0) {
        return {isComplete: true, message: num, result: points}
      }
    }
    i = infiniteCyclicCounter(i, length);
  }
}

function infiniteCyclicCounter(i: number, length: number): number {
  return   length === i+1 ? 0 : i+1
}

function weightedChance(describedPolygon: IPolygonDesc) {
  return Math.random() < describedPolygon.weight;
}

function describePolygons(feature: Feature<(Polygon | MultiPolygon)>): IPolygonDesc[] {
  const polygonsDesc: IPolygonDesc[] = []
  let totalArea = 0
  const polygons = feature.geometry.coordinates
  let t = 'type'
  if(feature.geometry.type === 'MultiPolygon') {
    for (let n = 0; n < polygons.length; n++) {
      const polygonDesc = createPolygonDesc(polygons[n] as Position[][])
      totalArea = totalArea + polygonDesc.area
      polygonsDesc.push(polygonDesc)
    }
  } else { // Polygon
    polygonsDesc.push(createPolygonDesc(polygons as Position[][]))
  }
  polygonsDesc.forEach(e => e.weight = e.area/totalArea )
  return polygonsDesc;
}

function createPolygonDesc(polygon: Position[][]):IPolygonDesc {
  const turfPoligon = turf.polygon(polygon);
  const area = turf.area(turfPoligon)
  const weight = 0;
  return {
    polygon: turfPoligon,
    area: area,
    weight: weight,
  }
}

function recursiveRandomPointInPolygon(polygon: Feature<(Polygon | MultiPolygon)>, depth: number = 500): Feature<Point> {
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
