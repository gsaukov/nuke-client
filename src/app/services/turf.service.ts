import {Injectable} from '@angular/core';
import * as turf from '@turf/turf';
import { BBox } from "@turf/helpers";

@Injectable({
  providedIn: 'root'
})
export class TurfService {

  constructor() {
  }

  public bbox(geojson: any): BBox {
    return turf.bbox(geojson);
  }

  public area(polygon: any): number {
    return turf.area(turf.polygon(polygon));
  }

}
