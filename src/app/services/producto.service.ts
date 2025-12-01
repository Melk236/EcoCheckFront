import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { map, Observable } from 'rxjs';
import { Producto } from '../types/producto';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {

  private url = environment.apiUrl + 'Producto';
  constructor(private http: HttpClient) { }
  get(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(this.url + '/' + id);
  }

  post(producto: Producto): Observable<Producto> {
    const body = {
      nombre: producto.nombre,
      marcaId: producto.marcaId,
      categoria: producto.categoria,
      paisOrigen: producto.paisOrigen,
      descripcion: producto.descripcion,
      ecoScore: producto.ecoScore,
      imagenUrl: producto.imagenUrl
    }

    return this.http.post<Producto>(this.url, body);
  }

  put(id: number, producto: Producto): Observable<Producto> {
    const body = {
      nombre: producto.nombre,
      marcaId: producto.marcaId,
      categoria: producto.categoria,
      paisOrigen: producto.paisOrigen,
      descripcion: producto.descripcion,
      ecoScore: producto.ecoScore,
      imagenUrl: producto.imagenUrl
    }
    return this.http.put<Producto>(this.url + '/' + id, body);

  }

  delete(id: number) {
    this.http.delete(this.url + '/' + id);
  }

 

}
