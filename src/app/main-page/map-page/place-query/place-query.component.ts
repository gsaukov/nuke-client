import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NominatimService} from "../../../services/nominatim.service";

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
      placeName: new FormControl(null, []),
      countryName: new FormControl(null, []),
      stateName: new FormControl(null, []),
      countyName: new FormControl(null, []),
      cityName: new FormControl(null, []),
    })
  }

  onSubmit() {

  }
}
