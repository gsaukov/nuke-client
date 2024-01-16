import {Component, OnInit} from '@angular/core';
import Map from 'ol/Map';
import Object from 'ol/Object'
import {MapService} from "../../services/map.service";



function logEvent(event:any) {
  console.log('Event type:', event.type);
}

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.css']
})
export class MapPageComponent implements OnInit {

  private _map!: Map;

  constructor(private mapService: MapService) {
  }

  ngOnInit(): void {
   this.mapService.buildMap().subscribe(map =>  {
     this._map = map
     // this._map.addEventListener('change', logEvent)
     // this._map.addEventListener('change:layerGroup', logEvent)
     // this._map.addEventListener('change:size', logEvent)
     // this._map.addEventListener('change:target', logEvent)
     // this._map.addEventListener('change:view', logEvent)
     // this._map.addEventListener('postrender', logEvent)
     // this._map.addEventListener('precompose', logEvent)
     // this._map.addEventListener('propertychange', logEvent)


     this._map.addEventListener('addfeature' , logEvent)
     this._map.addEventListener('changefeature' , logEvent)
     this._map.addEventListener('clear' , logEvent)
     this._map.addEventListener('removefeature' , logEvent)
     this._map.addEventListener('featuresloadstart' , logEvent)
     this._map.addEventListener('featuresloadend' , logEvent)
     this._map.addEventListener('featuresloaderror', logEvent)

    }
   );
  }

  get map(): Map {
    return this._map;
  }
}
