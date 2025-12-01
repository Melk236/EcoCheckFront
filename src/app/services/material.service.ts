import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../types/material';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  
  private url=environment.apiUrl+'Material';
  constructor(private http:HttpClient){}

  get():Observable<Material[]>{
    return this.http.get<Material[]>(this.url);
  }

  getById(id:number):Observable<Material[]>{
    return this.http.get<Material[]>(this.url+'/'+id);
  }

  post(materiales:Material[]):Observable<Material[]>{
    const body: { productoId: number; nombre: string; reciclable: boolean; impactoCarbono: number; }[]=[];

    materiales.forEach((valor)=>{//Rellenamos el body con todos los materiales.
      body.push({
        productoId:valor.productoId,
        nombre:valor.nombre,
        reciclable:valor.reciclable,
        impactoCarbono:valor.impactoCarbono

      });
    });

    return this.http.post<Material[]>(this.url,body);

  }

  put(id:number,material:Material):Observable<Material>{

  const body={
    producto:material.productoId,
    nombre:material.nombre,
    reciclable:material.reciclable,
    impactoCarbono:material.impactoCarbono
  }

  return this.http.put<Material>(this.url+'/'+id,body);

  }

  delete(id:number){
    this.http.delete(this.url+'/'+id);
  }
}
