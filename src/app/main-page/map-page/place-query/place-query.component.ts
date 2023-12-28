import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimQuery, NominatimResult, NominatimService} from "../../../services/nominatim.service";
import {of} from "rxjs";
import {mergeMap} from "rxjs/operators";
import {ActivatedRoute, Params, Router} from "@angular/router";

export interface IPlaceQueryQueryParameters extends NominatimQuery {
  queryType?: string;
}

@Component({
  selector: 'app-place-query',
  templateUrl: './place-query.component.html',
  styleUrls: ['./place-query.component.css']
})
export class PlaceQueryComponent {

  form!: FormGroup
  searchInitialized: boolean
  nominatimResult: NominatimResult[]

  constructor(private nominatimService: NominatimService, private router: Router, private route: ActivatedRoute) {
    this.searchInitialized = false;
    this.nominatimResult = [];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      let queryTypeParam = params['queryType'] ? params['queryType'] : 'q'
      this.form = new FormGroup({
        queryType: new FormControl(queryTypeParam, [Validators.required]),
        placeQuery: new FormControl(params['q'], []),
        countryName: new FormControl(params['country'], []),
        stateName: new FormControl(params['state'], []),
        countyName: new FormControl(params['county'], []),
        cityName: new FormControl(params['city'], []),
      })
    })
  }

  onSubmit() {
    let queryObject = this.createQueryObject()
    of(queryObject).pipe(
      mergeMap(() => this.nominatimService.searchPlaceQuery(queryObject)),
      mergeMap((nominatimResult) => {
        this.nominatimResult = nominatimResult;
        this.searchInitialized = true;
        this.addQueryParametersToUrl(queryObject)
        return of()
      })
    ).subscribe();
  }

  createQueryObject(): NominatimQuery {
    if (this.getQueryType()=== 'q') {
      return {
        q: this.form.controls['placeQuery'].value,
      }
    } else {
      return {
        country: this.form.controls['countryName'].value,
        state: this.form.controls['stateName'].value,
        county: this.form.controls['countyName'].value,
        city: this.form.controls['cityName'].value,
      }
    }

  }

  getQueryType(): string {
    return this.form.controls['queryType'].value
  }

  addQueryParametersToUrl(nominatimQuery: NominatimQuery) {
    let queryParams: IPlaceQueryQueryParameters = {...nominatimQuery, ...{queryType: this.getQueryType()}}
    this.router.navigate([], {queryParams: queryParams})
  }
}
