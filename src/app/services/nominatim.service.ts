import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from "rxjs";

const API_URL = 'https://nominatim.openstreetmap.org'

export interface NominatimQuery {
  q?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
}

export interface NominatimResult {
  addresstype: string;
  boundingbox: number []
  class: string;
  display_name: string;
  importance: number;
  lat: number;
  lon: number;
  licence: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  place_rank: number;
  type: string;
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

  searchPlaceQuery(queryObject: NominatimQuery): Observable<NominatimResult[]> {
    let query = new HttpParams({fromObject: this.deleteNullParameters(queryObject) as any}).toString()
    return this.http.get<any>(`${API_URL}/search?X-Requested-With=overpass-turbo&format=json&${query}`)
  }

  private deleteNullParameters (queryObject: any) {
    return Object.fromEntries(Object.entries(queryObject).filter(([_, v]) => v != null));
  }

}
