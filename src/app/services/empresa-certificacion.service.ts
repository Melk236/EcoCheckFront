import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaCertificacion } from '../types/empresa-certificacion';
import { Empresa } from '../types/empresa';

@Injectable({
  providedIn: 'root',
})
export class EmpresaCertificacionService {
  private url = environment.apiUrl + 'EmpresaCertificacion';

  constructor(private http: HttpClient) { }

  get(): Observable<EmpresaCertificacion[]> {
    return this.http.get<EmpresaCertificacion[]>(this.url);
  }

  getById(id: number): Observable<EmpresaCertificacion[]> {
    return this.http.get<EmpresaCertificacion[]>(this.url + '/' + id);
  }

  post(empresaCertificacion: EmpresaCertificacion[]): Observable<EmpresaCertificacion[]> {
    const body: { marcaId: number; certificacionId: number; }[] = [];

    empresaCertificacion.forEach((valor) => {
      body.push({
        marcaId: valor.marcaId,
        certificacionId: valor.certificacionId
      });
    });

    return this.http.post<EmpresaCertificacion[]>(this.url,body);
  }

  put(id:number,empresaCertificacion:EmpresaCertificacion):Observable<EmpresaCertificacion>{
    const body={
      marcaId:empresaCertificacion.marcaId,
      certificacionId:empresaCertificacion.certificacionId
    };

    return this.http.put<EmpresaCertificacion>(this.url+'/'+id,body);
  }

  delete(id:number){
    this.http.delete(this.url+'/'+id);
  }
}
