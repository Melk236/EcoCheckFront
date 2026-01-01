import { Component, OnDestroy, OnInit } from '@angular/core';
import { Empresa } from '../../types/empresa';
import { EmpresaService } from '../../services/empresa.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CertificacionesService } from '../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../services/empresa-certificacion.service';
import { Certificaciones } from '../../types/certificaciones';
import { EmpresaCertificacion } from '../../types/empresa-certificacion';


@Component({
  selector: 'app-lista-empresas',
  imports: [],
  templateUrl: './lista-empresas.html',
  styleUrl: './lista-empresas.css',
})
export class ListaEmpresas implements OnInit, OnDestroy {

  /*Variables para los datos provenientes de la DB*/
  empresas: Empresa[] = [];
  certificaciones: Certificaciones[] = [];
  empresaCertificacion: EmpresaCertificacion[] = [];

  /*Array de objetos con la empresa y sus certificaciones correspondientes */
  listaEmpresas: {id: number,nombre: string,empresaMatriz?: string,paisSede?: string,sitioWeb?:string,certificaciones?: string,puntuacionSocial: number,ontroversias: string,descripcion: string,certificacion:string[]}={
    id: 0,
    nombre: '',
    puntuacionSocial: 0,
    ontroversias: '',
    descripcion: '',
    certificacion: []
  }

  /*Para desuscribirnos de los observables al destruirse el componente*/
  destroy$ = new Subject<void>();

  constructor(private empresaService: EmpresaService, private certificacionesService: CertificacionesService, private empresaCertificacionService: EmpresaCertificacionService) { }


  /*Nos treamos los datos necesarios de la DB*/
  ngOnInit(): void {
    this.obtenerDatos();
  }

  /*Obtenemos las empresas*/
  obtenerDatos() {

    forkJoin({
      empresas: this.empresaService.get(),
      certificaciones: this.certificacionesService.get(),
      empresaCertificacion: this.empresaCertificacionService.get()
    }).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (data) => {
          this.empresas = data.empresas;
          this.certificaciones = data.certificaciones;
          this.empresaCertificacion = data.empresaCertificacion;
        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }

  /*Desuscribirnos a los observables al destruirse los componentes*/
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
