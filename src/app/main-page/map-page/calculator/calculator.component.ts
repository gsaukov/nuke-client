import {Component, OnInit} from '@angular/core';
import Map from 'ol/Map';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimService} from "../../../services/nominatim.service";
import {OverpassService} from "../../../services/overpass.service";
import {MapService} from "../../../services/map.service";
import {Feature as TurfFeature, MultiPolygon, Point, Polygon} from "@turf/turf";
import {mergeMap, catchError, finalize, Observable, of, zip} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {LayersService} from "../../../services/layers.service";
import {EventsService} from "../../../services/events.service";
import {Osm2GeojsonService} from "../../../services/osm2seojson.service";

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

export interface ICalculationQueryParameters {
  placeType: string;
  placeName: string;
  radius: number;
  number: number;
}

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent  implements OnInit {

  map!: Map;
  form!: FormGroup
  defaultPlaceTypeSelect: boolean = true;
  errorMessage: string|any = null
  loading: boolean = false
  working: boolean = false
  calculationResults!: ICalculationResults|null;

  constructor(private mapService: MapService,
              private layersService: LayersService,
              private eventsService: EventsService,
              private nominatimService: NominatimService,
              private overpassService: OverpassService,
              private osm2GeojsonService: Osm2GeojsonService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.map = this.mapService.getMap()
    this.route.queryParams.subscribe((params: Params) => {
      this.defaultPlaceTypeSelect = !params['placeType']
      this.form = new FormGroup({
        placeType: new FormControl(params['placeType'], [Validators.required]),
        placeName: new FormControl(params['placeName'], [Validators.required]),
        radius: new FormControl(params['radius'], [Validators.required]),
        number: new FormControl(params['number'], [Validators.required]),
      })
    })
  }

  addQueryParametersToUrl(placeType: string, placeName: string, radius: number, number: number) {
    let queryParams: ICalculationQueryParameters = {
      placeType: placeType,
      placeName: placeName,
      radius: radius,
      number: number
    }
    this.router.navigate([], {queryParams: queryParams})
  }

  onSubmit() {
    this.errorMessage = null
    this.form.disable()
    this.loading = true
    const placeType = this.form.controls['placeType'].value
    const placeName = this.form.controls['placeName'].value
    const radius = this.form.controls['radius'].value
    const num = this.form.controls['number'].value
    this.calculationResults = this.newCalculationResults(placeName, radius, num)
    this.addQueryParametersToUrl(placeType, placeName, radius, num);
    of(placeName).pipe(
      mergeMap((placeName)=> this.nominatimService.searchPlace(placeType, placeName)),
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
    return this.overpassService.getRelationGeometryData(data[0].osm_id);
  }

  private printOnMap(overpassRes: any, num: number, radius: number): Observable<unknown[]> {
    return of(this.osm2GeojsonService.convert(overpassRes)).pipe(
      mergeMap(geoJsonObject => {
        this.working = true;
        return zip(
          this.layersService.addGeoJsonAndEventLayer(geoJsonObject, num, radius, this.workerCallBacks),
          this.mapService.setViewOnGeoJson(geoJsonObject)
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
    this.eventsService.terminateRandomPointsWorker()
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
