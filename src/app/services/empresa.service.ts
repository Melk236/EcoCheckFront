import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../types/empresa';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private url=environment.apiUrl+'Marca';

  constructor(private http:HttpClient){}

  get():Observable<Empresa[]>{
    return this.http.get<Empresa[]>(this.url);
  }

  getById(id:number):Observable<Empresa>{
    return this.http.get<Empresa>(this.url+'/'+id)
  }

  post(empresa:Empresa):Observable<Empresa>{ 
    const body={
      nombre:empresa.nombre,
      empresaMatriz:empresa.empresaMatriz,
      paisSede:empresa.paisSede,
      sitioWeb:empresa.sitioWeb,
      certificaciones:empresa.certificaciones,
      puntuacionAmbiental:empresa.puntuacionAmbiental,
      puntuacionSocial:empresa.puntuacionSocial,
      puntuacionGobernanza:empresa.puntuacionGobernanza
    }
    return this.http.post<Empresa>(this.url,body);
    
  }

  delete(id:number){
    this.http.delete(this.url+'/'+id);
  }
}
