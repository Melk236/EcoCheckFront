import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificaciones } from '../types/certificaciones';

@Injectable({
  providedIn: 'root',
})
export class CertificacionesService {

  private url = environment.apiUrl + 'Certificacion';

  constructor(private http: HttpClient) { }

  get(): Observable<Certificaciones[]> {

    return this.http.get<Certificaciones[]>(this.url);
  }

  getById(id: number): Observable<Certificaciones[]> {//Nos devuelve una lista de certificaciones que contiene esa empresa
    return this.http.get<Certificaciones[]>(this.url + '/' + id);

  }

  post(certificaciones: Certificaciones[]) {
    const body: { nombre: string; descripcion: string; }[] = [];

    certificaciones.forEach((valor) => {
      body.push({
        nombre: valor.nombre,
        descripcion: valor.descripcion
      });
    });

    return this.http.post<Certificaciones[]>(this.url, body);
  }

  delete(id: number) {
    
    this.http.delete(this.url+'/'+id);
  }
}
