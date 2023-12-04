import {Component, Input} from '@angular/core';
import Map from 'ol/Map';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimService} from "../../../services/nominatim.service";
import {OverpassService} from "../../../services/overpass.service";
import {MapService} from "../../../services/map.service";
import {Feature as TurfFeature, MultiPolygon, Polygon} from "@turf/turf";
import {finalize, Observable, zip} from "rxjs";
import {catchError, mergeMap} from 'rxjs/operators';
import { of } from 'rxjs';
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
  errorMessage: string|any = null
  loading: boolean = false

  constructor(private mapService: MapService, private nominatimService: NominatimService, private overpassService: OverpassService) {
    this.form = new FormGroup({
      cityName: new FormControl(null, [Validators.required]),
      radius: new FormControl(null, [Validators.required]),
      number: new FormControl(null, [Validators.required]),
    })
  }

  onSubmit() {
    this.errorMessage = null
    this.form.disable()
    this.loading = true
    const cityName = this.form.controls['cityName'].value
    const radius = this.form.controls['radius'].value
    const num = this.form.controls['number'].value

    of(cityName).pipe(
      mergeMap((cityName)=> this.nominatimService.getCityData(cityName)),
      mergeMap(nominatimRes => this.getOverpassData(nominatimRes)),
      mergeMap(overpassRes => this.printOnMap(overpassRes, num, radius)),
      catchError(e => {
        this.processError(e);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.form.enable()
      })
    ).subscribe();
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

  private printOnMap(overpassRes: any, num: number, radius: number): Observable<unknown[]> {
    return of(osm2geojson(overpassRes, { completeFeature: true })).pipe(
      mergeMap(geoJsonObject => {
        return zip(
          this.mapService.addGeometryLayer(this.map, geoJsonObject),
          this.mapService.addCircles(this.map, geoJsonObject.features[0] as TurfFeature<(Polygon | MultiPolygon)>, num, radius),
          this.mapService.setViewOnGeoJson(this.map, geoJsonObject)
        );
      })
    );
  }

  private processError(e: Error){
    this.errorMessage = e.message
    this.loading = false
    this.form.enable()
  }

}
