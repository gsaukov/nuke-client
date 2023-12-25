import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimQuery, NominatimResult, NominatimService} from "../../../services/nominatim.service";
import {Observable, of} from "rxjs";
import {mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-place-query',
  templateUrl: './place-query.component.html',
  styleUrls: ['./place-query.component.css']
})
export class PlaceQueryComponent {

  form: FormGroup
  nominatimResult: NominatimResult[];

  constructor(private nominatimService: NominatimService) {
    this.nominatimResult = [];
    this.form = new FormGroup({
      queryType: new FormControl('q', [Validators.required]),
      placeQuery: new FormControl(null, []),
      countryName: new FormControl(null, []),
      stateName: new FormControl(null, []),
      countyName: new FormControl(null, []),
      cityName: new FormControl(null, []),
    })
  }

  onSubmit() {
    of(this.createQueryObject()).pipe(
      mergeMap((queryObject) => this.nominatimService.searchPlaceQuery(queryObject)),
      mergeMap((nominatimResult) => {this.nominatimResult = nominatimResult; return of()})
    ).subscribe();
  }

  createQueryObject(): NominatimQuery {
    if (this.form.controls['queryType'].value === 'q') {
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
}
