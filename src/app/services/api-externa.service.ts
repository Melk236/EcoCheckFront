import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import {  Producto } from '../types/producto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class ApiExternaService {
  private apiOpenFood=environment.openFoodApi;
  constructor(private http:HttpClient){}


  getOpenFood(idProducto:string):Observable<Producto>{
    
    return this.http.get<Producto>(this.apiOpenFood+idProducto);
  }
}
