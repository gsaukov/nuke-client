import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";

const API_URL = 'https://www.overpass-api.de'

@Injectable({
  providedIn: 'root'
})
export class OverpassService {

  constructor(private http: HttpClient) {
  }

  getGeometryData(val: string): Observable<any> {
    const query = `[out:json];area(id:${val});rel(pivot);out body geom;`;
    const encodedQuery = encodeURIComponent(query);
    return this.http.get<any>(`${API_URL}/api/interpreter?data=${encodedQuery}`)
  }

}
