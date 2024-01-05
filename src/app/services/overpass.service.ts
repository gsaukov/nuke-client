import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";

const API_URL = 'https://www.overpass-api.de'

@Injectable({
  providedIn: 'root'
})
export class OverpassService {

  private static COUNTRY_ID_PREFIX = "36";

  constructor(private http: HttpClient) {
  }

  getRelationGeometryData(osmId: number): Observable<any> {
    const adjustedOsmId = OverpassService.getOverpassCountryId(osmId)
    const query = `[out:json];area(id:${adjustedOsmId});rel(pivot);out body geom;`
    const encodedQuery = encodeURIComponent(query);
    return this.http.get<any>(`${API_URL}/api/interpreter?data=${encodedQuery}`)
  }

  getWayGeometryData(osmId: number): Observable<any> {
    const query = `[out:json];area(id:${osmId});way(pivot);out geom;`
    const encodedQuery = encodeURIComponent(query);
    return this.http.get<any>(`${API_URL}/api/interpreter?data=${encodedQuery}`)
  }

  getNodeGeometryData(osmId: number): Observable<any> {
    const query = `[out:json];node(id:${osmId});out geom;`
    const encodedQuery = encodeURIComponent(query);
    return this.http.get<any>(`${API_URL}/api/interpreter?data=${encodedQuery}`)
  }

  static getOverpassCountryId(osmId: number) {
    const formatted = String(osmId).padStart(8, '0');
    return this.COUNTRY_ID_PREFIX + formatted;
  }

}
