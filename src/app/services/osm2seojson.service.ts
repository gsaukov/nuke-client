import {Injectable} from '@angular/core';
import * as osmtogeojson from "osmtogeojson";
import {FeatureCollection} from "@turf/helpers/dist/js/lib/geojson";

@Injectable({
  providedIn: 'root'
})
export class Osm2GeojsonService {

  convert(overpassRes:any):FeatureCollection {
    return osmtogeojson(overpassRes) as FeatureCollection;
  }

}
