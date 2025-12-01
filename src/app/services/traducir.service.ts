import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TraducirService {
  
  private url=environment.apiUrl+'Traduccion';

  constructor(private http:HttpClient){}

  post(texto:string):Observable<{texto:string}>{
    const body={
      texto:texto
    }
    return this.http.post<{texto:string}>(this.url,body);
  }
}
