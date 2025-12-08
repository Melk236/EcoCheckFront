import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Puntuacion } from '../types/puntuacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PuntuacionService {

  private url = environment.apiUrl + 'Puntuacion';

  constructor(private http: HttpClient) { }

  get(): Observable<Puntuacion[]> {
    return this.http.get<Puntuacion[]>(this.url);
  }

  getById(id: number): Observable<Puntuacion> {
    return this.http.get<Puntuacion>(this.url + '/' + id);
  }

  post(puntuacion: Puntuacion): Observable<Puntuacion> {
    const body = {
      productoId: puntuacion.productoId,
      valor: puntuacion.valor,
      valorAmbiental: puntuacion.valorAmbiental,
      valorSocial: puntuacion.valorSocial
    }

    return this.http.post<Puntuacion>(this.url, body);

  }

  put(id: number, puntuacion: Puntuacion) {
    const body = {
      productoId: puntuacion.productoId,
      valor: puntuacion.valor,
      valorAmbiental: puntuacion.valorAmbiental,
      valorSocial: puntuacion.valorSocial
    }

    return this.http.put<Puntuacion>(this.url, body);
  }

  delete(id: number) {
    return this.http.delete(this.url);
  }
}
