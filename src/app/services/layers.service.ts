import {Injectable} from '@angular/core';
import { Map as OlMap } from "ol";
import {Vector} from "ol/layer";
import {MapService} from "./map.service";
import VectorSource from "ol/source/Vector";
import {Geometry} from "ol/geom";
import {v4 as uuidv4} from 'uuid';

export interface ILayerID {
  osm_id: string;
  uuid: string;
}


@Injectable({
  providedIn: 'root'
})
export class LayersService {

  private map!: OlMap;
  private layerData!: Map<string, Map<string, Vector<VectorSource<Geometry>>>>;


  constructor(private mapService: MapService) {
    this.map = mapService.getMap()
  }

  addLayer(osm_id:string, layerData:Vector<VectorSource<Geometry>>):ILayerID{
    return {
      osm_id: osm_id,
      uuid: uuidv4()
    }
  }

  removeLayer(id:ILayerID){

  }

  getLayer(id:ILayerID) {

  }

}
