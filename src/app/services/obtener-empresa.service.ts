import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { BusquedaEmpresaId, WikidataResponse } from '../types/empresa';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ObtenerEmpresaService {

  private apiWikiId = environment.apiWikiDataIdEmpresa;
  private apiWikiData = environment.apiWikiData;

  constructor(private http: HttpClient) { }

  searchCompanyId(nombreEmpresa: string): Observable<any> {
    const url = this.apiWikiId + nombreEmpresa + '&format=json&language=es&type=item&origin=*';

    return this.http.get<any>(url).pipe(
      map((res) => {
        const items = res.search;
          
        if (!items) return null;

        // 1. Buscar empresa por descripción
        let empresa = items.find((i: any) =>
          (i.description ?? "").toLowerCase().includes("manufacturer") ||
          (i.description ?? "").toLowerCase().includes("empresa") ||
          (i.description ?? "").toLowerCase().includes("company") ||
          (i.description ?? "").toLowerCase().includes("chocolate") ||
          (i.description ?? "").toLowerCase().includes("confectionery")
        );
        console.log(empresa)
        // 2. Si no encontró, buscar por nombre exacto "Ferrero SpA"
        if (!empresa) {
          empresa = items.find((i: any) =>
            i.label?.toLowerCase().includes(nombreEmpresa.toLowerCase()) &&
            i.label?.toLowerCase().includes("spa")
          );
        }

        return empresa || null;
      })
    );
  }

  // Obtener información de una entidad por su ID
  getCompanyInfo(entityId: string): Observable<WikidataResponse> {
    const url = `${this.apiWikiData}${entityId}.json`;
    return this.http.get<WikidataResponse>(url);
  }
}
