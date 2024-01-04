import {Injectable} from '@angular/core';
import * as osm2geojson from "osm2geojson-lite";
import {FeatureCollection} from "@turf/helpers/dist/js/lib/geojson";



@Injectable({
  providedIn: 'root'
})
export class Osm2GeojsonService {

  convert(overpassRes:any):FeatureCollection {
    return osm2geojson(overpassRes, {completeFeature: true}) as FeatureCollection;
  }

}
