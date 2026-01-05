import { Component, OnDestroy, OnInit } from '@angular/core';
import { Empresa, IListaEmpresas } from '../../types/empresa';
import { EmpresaService } from '../../services/empresa.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CertificacionesService } from '../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../services/empresa-certificacion.service';
import { Certificaciones } from '../../types/certificaciones';
import { EmpresaCertificacion } from '../../types/empresa-certificacion';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from "../../shared/paginacion/paginacion.component";



@Component({
  selector: 'app-lista-empresas',
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './lista-empresas.html',
  styleUrl: './lista-empresas.css',
})
export class ListaEmpresasComponent implements OnInit, OnDestroy {

  /*Variables para los datos provenientes de la DB*/
  empresas: Empresa[] = [];
  certificaciones: Certificaciones[] = [];
  empresaCertificacion: EmpresaCertificacion[] = [];
  clasesEmpresa = new Map<number, string>();

  /*Array de objetos con la empresa y sus certificaciones correspondientes */
  listaEmpresas: IListaEmpresas[] = [];
  listaEmpresasPaginacion: IListaEmpresas[] = [];
  numElementos: number = 6;
  pagActual: number = 1;
  numPaginasTotal: number = 0;
  paginas: number[] = [];

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

          //Cuando todos los datos estén listos asociamos las empresas con sus certificaciones
          this.asociarCertificacionEmpresa();

        },
        error: (error) => {
          console.log(error);
        }
      }
    );
  }

  /*Asociamos la empresa con sus certificaciones*/
  asociarCertificacionEmpresa() {

    this.empresas.forEach((valor, index) => {

      this.listaEmpresas[index] = {
        id: valor.id,
        nombre: valor.nombre,
        empresaMatriz: valor.empresaMatriz,
        paisSede: valor.paisSede,
        sitioWeb: valor.sitioWeb,
        certificaciones: valor.certificaciones,
        puntuacionSocial: valor.puntuacionSocial,
        controversias: valor.controversias,
        descripcion: valor.descripcion,
        certificacion: []

      };

      const certificacion = this.empresaCertificacion.filter(item => item.marcaId == valor.id);

      if (certificacion !== undefined && certificacion.length >= 0) {
        certificacion.forEach((cert) => {
          const encontrado = this.certificaciones.find(item => item.id == cert.certificacionId);

          if (encontrado !== undefined) {
            this.listaEmpresas[index].certificacion.push(encontrado.nombre);

          }

        });
      }

    });

    // Creamos una nueva referencia para que se actualice el @Input() del hijo
    this.listaEmpresas = [...this.listaEmpresas];  // Crea una NUEVA referencia



  }
  paginar(listaEmpresas: any) {
   
    

    // Ejecutar DESPUÉS del ciclo de detección de cambios
    setTimeout(() => {
       this.listaEmpresasPaginacion = listaEmpresas;
      this.clasesEmpresa.clear();
      this.listaEmpresasPaginacion.forEach((valor) => {
        this.clasesEmpresa.set(valor.id, this.getPuntuacionClase(valor));
      });
    }, 0);
  }

  /*Colores del ngClass */
  getPuntuacionClase(empresa: IListaEmpresas): string {
    const score = empresa.puntuacionSocial ?? 0;

    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  /*Desuscribirnos a los observables al destruirse los componentes*/
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
