import {Feature, MultiPolygon, Point, Polygon} from "@turf/turf";
import {recursiveRandomPointInPolygon} from "../random-point-in-polygon.function";
import {RandomPointsWorkerProgress} from "./random-points.worker";

export function randomPointsInPolygon(num: number, polygon: Feature<(Polygon | MultiPolygon)>): RandomPointsWorkerProgress {
  const points: Feature<Point>[] = []
  for(let i = 0; i < num; i++ ) {
    points[i] = recursiveRandomPointInPolygon(polygon)
    if(i%100===0){
      self.postMessage({isComplete: false, message: i, result: points});
    }
  }
  self.postMessage({isComplete: false, message: num, result: points});
  return {isComplete: true, result: points};
}
