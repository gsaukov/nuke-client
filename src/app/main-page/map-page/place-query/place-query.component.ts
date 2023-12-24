import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimService} from "../../../services/nominatim.service";
import {of} from "rxjs";
import {mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-place-query',
  templateUrl: './place-query.component.html',
  styleUrls: ['./place-query.component.css']
})
export class PlaceQueryComponent {

  form: FormGroup

  constructor(private nominatimService: NominatimService) {
    this.form = new FormGroup({
      queryType: new FormControl(null, [Validators.required]),
      placeQuery: new FormControl(null, []),
      countryName: new FormControl(null, []),
      stateName: new FormControl(null, []),
      countyName: new FormControl(null, []),
      cityName: new FormControl(null, []),
    })
  }

  onSubmit() {
    let queryObject = {
      q: this.form.controls['placeQuery'].value,
      country: this.form.controls['countryName'].value,
      state: this.form.controls['stateName'].value,
      county: this.form.controls['countyName'].value,
      city: this.form.controls['cityName'].value,
    }

    of(queryObject).pipe(
      mergeMap((queryObject) => this.nominatimService.searchPlaceQuery(queryObject)),
    ).subscribe();
  }
}
