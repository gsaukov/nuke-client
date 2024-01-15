import {Component, OnInit} from '@angular/core';
import Map from 'ol/Map';
import {MapService} from "../../services/map.service";

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
    if (!this._map) {
      this.mapService.buildMap().subscribe(map => this._map = map);
    }
  }

  get map(): Map {
    return this._map;
  }
}
