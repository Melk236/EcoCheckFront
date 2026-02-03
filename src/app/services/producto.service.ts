import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { map, Observable } from 'rxjs';
import { Producto } from '../types/producto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { not } from 'rxjs/internal/util/not';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {

  private url = environment.apiUrl + 'Producto';
  constructor(private http: HttpClient) { }
  get(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  /*Para traerse los productos que tengan la misma categoría y mayor nota */
  getComparacion(categoria: string, nota: number): Observable<Producto[]> {
    let params = new HttpParams();

    params = params.set('categoria', categoria);
    params = params.set('nota', nota);
    return this.http.get<Producto[]>(this.url + '/Comparativa', { params });
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
      ingredientes: producto.ingredientes,
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
      ingredientes: producto.ingredientes,
      ecoScore: producto.ecoScore,
      imagenUrl: producto.imagenUrl
    }
    return this.http.put<Producto>(this.url + '/' + id, body);

  }

  delete(id: number) {
    this.http.delete(this.url + '/' + id);
  }



}
