import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from "rxjs";

const API_URL = 'https://nominatim.openstreetmap.org'

export interface NominatimQuery {
  city: string;
  county: string;
  state: string;
  country: string;
  q: string;
}

@Injectable({
  providedIn: 'root'
})
export class NominatimService {

  constructor(private http: HttpClient) {
  }

  searchPlace(placeType: string, placeName: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/search?X-Requested-With=overpass-turbo&format=json&${placeType}=${placeName}`)
  }

  searchPlaceQuery(queryObject: NominatimQuery): Observable<any> {
    let query = new HttpParams({fromObject: queryObject as any}).toString()
    return this.http.get<any>(`${API_URL}/search?X-Requested-With=overpass-turbo&format=json&${query}`)
  }

}
