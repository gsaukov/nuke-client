import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";

const API_URL = 'https://nominatim.openstreetmap.org'

@Injectable({
  providedIn: 'root'
})
export class NominatimService {

  constructor(private http: HttpClient) {
  }

  searchPlace(placeName: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/search?X-Requested-With=overpass-turbo&format=json&q=${placeName}`)
  }

}
