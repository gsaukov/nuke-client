/// <reference lib="webworker" />

import { randomPointsInPolygon } from "./random-points.function";

addEventListener('message', ({ data }) => {
  const response = randomPointsInPolygon(data.num, data.polygon);
  postMessage(response);
});
