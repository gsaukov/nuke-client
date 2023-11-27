import {Component, Input} from '@angular/core';
import Map from 'ol/Map';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimService} from "../../../services/nominatim.service";
import {OverpassService} from "../../../services/overpass.service";
import {MapService} from "../../../services/map.service";
import {Feature as TurfFeature, MultiPolygon, Polygon} from "@turf/turf";
import {Observable} from "rxjs";
import * as osm2geojson from 'osm2geojson-lite';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {

  private COUNTRY_ID_PREFIX = "36";

  @Input() map!: Map;
  form: FormGroup

  constructor(private mapService: MapService, private nominatimService: NominatimService, private overpassService: OverpassService) {
    this.form = new FormGroup({
      cityName: new FormControl(null, [Validators.required]),
      radius: new FormControl(null, [Validators.required]),
      number: new FormControl(null, [Validators.required]),
    })
  }

  onSubmit() {
    this.form.disable()
    const cityName = this.form.controls['cityName'].value
    const radius = this.form.controls['radius'].value
    const num = this.form.controls['number'].value
    this.nominatimService.getCityData(cityName)
      .subscribe((nominatimRes) => {
          this.getOverpassData(nominatimRes).subscribe((overpassRes) => {
            this.printOnMap(overpassRes, num, radius)
          }, (e) => {this.form.enable()})
        }, (e) => {this.form.enable()});
  }

  private getOverpassData(data: any): Observable<any> {
    console.log(data)
    const countryId = this.getOverpassCountryId(data[0].osm_id)
    return this.overpassService.getGeometryData(countryId);
  }

  private getOverpassCountryId(osmId: number) {
    const formatted = String(osmId).padStart(8, '0');
    return this.COUNTRY_ID_PREFIX + formatted;
  }

  private printOnMap(overpassRes: any, num: number, radius: number) {
    try {
      console.log(JSON.stringify(overpassRes))
      let geoJsonObject = osm2geojson(overpassRes, {completeFeature: true});
      console.log(JSON.stringify(geoJsonObject))
      this.mapService.addGeometryLayer(this.map, geoJsonObject).subscribe()
      this.mapService.addCircles(this.map, geoJsonObject.features[0] as TurfFeature<(Polygon | MultiPolygon)>, num, radius).subscribe()
      this.mapService.setViewOnGeoJson(this.map, geoJsonObject)
    } catch (e) {
      console.error(e)
    } finally {
      this.form.enable()
    }
  }

}
