import {Component, Input} from '@angular/core';
import Map from 'ol/Map';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimService} from "../../../services/nominatim.service";
import {OverpassService} from "../../../services/overpass.service";
import {MapService} from "../../../services/map.service";
import {Feature as TurfFeature, MultiPolygon, Point, Polygon} from "@turf/turf";
import {finalize, Observable, zip} from "rxjs";
import {catchError, mergeMap} from 'rxjs/operators';
import { of } from 'rxjs';
import * as osm2geojson from 'osm2geojson-lite';

export interface IWorkerCallbacks {
  onComplete: () => void;
  onError: (e: ErrorEvent) => void;
  onProgress: (data: TurfFeature<Point>[]) => void;
}

export interface ICalculationResults {
  placeName: string;
  placeID?: number;
  eventsRadius: number;
  eventsNumber: number;
  eventsNumberProgress: number;
}

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
  working: boolean = false
  calculationResults!: ICalculationResults|null;

  constructor(private mapService: MapService, private nominatimService: NominatimService, private overpassService: OverpassService) {
    this.form = new FormGroup({
      placeType: new FormControl(null, [Validators.required]),
      placeName: new FormControl(null, [Validators.required]),
      radius: new FormControl(null, [Validators.required]),
      number: new FormControl(null, [Validators.required]),
    })
  }

  onSubmit() {
    this.errorMessage = null
    this.form.disable()
    this.loading = true
    const placeName = this.form.controls['placeName'].value
    const radius = this.form.controls['radius'].value
    const num = this.form.controls['number'].value
    this.calculationResults = this.newCalculationResults(placeName, radius, num)

    of(placeName).pipe(
      mergeMap((placeName)=> this.nominatimService.searchPlace(placeName)),
      mergeMap(nominatimRes => this.getOverpassData(nominatimRes)),
      mergeMap(overpassRes => this.printOnMap(overpassRes, num, radius)),
      catchError(e => {
        this.processError(e);
        return of(null);
      }),
      finalize(() => {
        // Empty. Completion should be performed in randomPointsWorker.
        // this.loading = false;
        // this.form.enable()
      })
    ).subscribe();
  }

  private getOverpassData(data: any): Observable<any> {
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
        this.working = true;
        return zip(
          this.mapService.addGeometryLayer(this.map, geoJsonObject),
          this.mapService.addCircles(this.map, geoJsonObject.features[0] as TurfFeature<(Polygon | MultiPolygon)>, num, radius, this.workerCallBacks),
          this.mapService.setViewOnGeoJson(this.map, geoJsonObject)
        );
      })
    );
  }

  private newCalculationResults(placeName: string, eventsRadius: number, eventsNumber: number):ICalculationResults {
    return {
      placeName: placeName,
      eventsRadius: eventsRadius,
      eventsNumber: eventsNumber,
      eventsNumberProgress: 0,
    }
  }

  private trackProgress(data: TurfFeature<Point>[]) {
    this.calculationResults!.eventsNumberProgress = data.length;
  }

  private processError(e: Error){
    this.errorMessage = e.message
    this.calculationResults = null
    this.complete()
  }

  private complete(){
    this.working = false;
    this.loading = false
    this.form.enable()
  }

  terminateWorker() {
    this.mapService.terminateRandomPointsWorker()
    this.complete()
  }

  private workerCallBacks: IWorkerCallbacks = {
    onComplete: () => {
      this.complete()
    },

    onError: (e:ErrorEvent) => {
      this.processError(Error(e.message))
    },

    onProgress: (data: TurfFeature<Point>[]) => {
      this.trackProgress(data)
    }
  }
}
