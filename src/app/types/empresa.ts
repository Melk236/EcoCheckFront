export interface Empresa {
  id: number;
  nombre: string;
  empresaMatriz?: string;
  paisSede?: string;
  sitioWeb?: string;
  certificaciones?: string;
  puntuacionSocial:number;
  puntuacionAmbiental:number;
  puntuacionGobernanza:number; 
}

export interface BusquedaEmpresaId {
  search: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}
export interface CompanyInfo {
  nombre: string;
  empresaMatriz?: string;
  paisSede?: string;
  sitioWeb?: string;
  certificaciones?: string;
  descripcion?:string;
}

// Estructura de la respuesta de Wikidata
export interface WikidataResponse {
  entities: {
    [entityId: string]: {
      labels?: {
        [language: string]: {
          value: string;
        };
      };
      claims: {
        [propertyId: string]: Array<{
          mainsnak: {
            datavalue?: {
              value: string | {
                id: string;
              };
            };
          };
        }>;
      };
    };
  };
}

export interface DescripcionResponse{
  display:Description;
}

export interface Description{
  value:string;
}
