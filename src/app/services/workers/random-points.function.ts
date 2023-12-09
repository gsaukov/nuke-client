import {Feature, MultiPolygon, Point, Polygon, Position} from "@turf/turf";
import {recursiveRandomPointInPolygon} from "../random-point-in-polygon.function";
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
    i = infiniteCounter(i, length);
  }
}

function infiniteCounter(i: number, length: number): number {
  return   length === i+1 ? 0 : i+1
}

function weightedChance(describedPolygon: IPolygonDesc) {
  return Math.random() < describedPolygon.weight;
}

function describePolygons(feature: Feature<(Polygon | MultiPolygon)>): IPolygonDesc[] {
  const polygonsDesc: IPolygonDesc[] = []
  let totalArea = 0
  const polygons = feature.geometry.coordinates
  for (let n = 0; n < polygons.length; n++) {
    const polygonDesc = createPolygonDesc(polygons[n] as Position[][])
    totalArea = totalArea + polygonDesc.area
    polygonsDesc.push(polygonDesc)
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
