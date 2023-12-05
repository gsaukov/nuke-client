/// <reference lib="webworker" />

import { randomPointsInPolygon } from "./random-points.function";
import {Feature, Point} from "@turf/turf";

addEventListener('message', ({ data }) => {
  const response = randomPointsInPolygon(data.num, data.polygon);
  postMessage(response);
});

export interface RandomPointsWorkerProgress {
  isComplete: boolean;
  message?: any;
  result?: Feature<Point>[];
}
