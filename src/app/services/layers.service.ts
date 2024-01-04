import {Injectable} from '@angular/core';
import { Map as OlMap } from "ol";
import {Vector} from "ol/layer";
import {MapService} from "./map.service";
import VectorSource from "ol/source/Vector";
import {Geometry} from "ol/geom";
import {v4 as uuidv4} from 'uuid';
import {Observable, of, switchMap} from "rxjs";
import {GeoJSON} from "ol/format";
import {Fill, Stroke, Style} from "ol/style";
import {Feature as TurfFeature, FeatureCollection} from "@turf/helpers/dist/js/lib/geojson";
import {MultiPolygon, Polygon} from "@turf/turf";
import {EventsService} from "./events.service";

export interface ILayerID {
  geoJsonId: string;
  uuid: string;
}


@Injectable({
  providedIn: 'root'
})
export class LayersService {
  public static LAYER_ID = 'LAYER_ID'
  private map!: OlMap;
  private layerData: Map<string, Map<string, Vector<VectorSource<Geometry>>>>;


  constructor(private mapService: MapService, private eventsService:EventsService) {
    this.map = mapService.getMap()
    this.layerData = new Map()
  }

  addGeoJsonAndEventLayer(geoJsonObject: any, num: number, radius: number, workerCallBacks: any): Observable<void> {
    return this.addGeoJsonLayer(geoJsonObject).pipe(
      switchMap(layerId => {
        const polygon = geoJsonObject.features[0] as TurfFeature<(Polygon | MultiPolygon)>;
        return this.addEventLayer(layerId, polygon, num, radius, workerCallBacks);
      })
    );
  }

  addGeoJsonLayer(geoJsonObject: FeatureCollection): Observable<ILayerID> {
    return new Observable((observer) => {
      const geojsonFormat = new GeoJSON();
      const vectorSource = new VectorSource();
      const features = geojsonFormat.readFeatures(geoJsonObject, {
        featureProjection: 'EPSG:3857',
      });
      vectorSource.addFeatures(features)
      const geojsonId = features[0].getId()
      const layer = new Vector({
        source: vectorSource,
        style: [
          new Style({
            stroke: new Stroke({color: 'blue', width: 3}),
            fill: new Fill({color: 'rgba(0, 0, 255, 0.1)'})
          })
        ]
      });
      const layerId = {
        geoJsonId: geojsonId as string,
        uuid: uuidv4()
      }
      layer.set(LayersService.LAYER_ID, layerId)
      this.addToLayerData(layerId, layer)
      this.map.addLayer(layer);

      observer.next(layerId);
      observer.complete();
    });
  }

  addEventLayer(layerID:ILayerID, polygon: TurfFeature<(Polygon | MultiPolygon)>, num: number, radius: number, workerCallBacks: any): Observable<void> {
    const vectorSource = this.getLayerVector(layerID).getSource()!
    return of(this.eventsService.addEventsToVector(vectorSource, polygon, num, radius, workerCallBacks))
  }

  removeLayer(layerId:ILayerID){
    this.map.getLayers().forEach(layer => {
      if (layer && layer.get(LayersService.LAYER_ID) === layerId) {
        this.map.removeLayer(layer);
      }
    });
  }

  getLayerVector(layerId:ILayerID):Vector<VectorSource<Geometry>> {
    return this.layerData.get(layerId.geoJsonId)!.get(layerId.uuid)!
  }

  private addToLayerData(layerId: ILayerID, vector: Vector<VectorSource<Geometry>>) {
    if(this.layerData.has(layerId.geoJsonId)){
      this.layerData.get(layerId.geoJsonId)?.set(layerId.uuid, vector)
    } else {
      const vectorMap = new Map()
      vectorMap.set(layerId.uuid, vector)
      this.layerData.set(layerId.geoJsonId, vectorMap)
    }
  }

}
