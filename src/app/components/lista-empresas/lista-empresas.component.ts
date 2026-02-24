import { Component, OnDestroy, OnInit, ɵNG_INJ_DEF } from '@angular/core';
import { Empresa, IListaEmpresas } from '../../types/empresa';
import { EmpresaService } from '../../services/empresa.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CertificacionesService } from '../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../services/empresa-certificacion.service';
import { Certificaciones } from '../../types/certificaciones';
import { EmpresaCertificacion } from '../../types/empresa-certificacion';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from "../../shared/paginacion/paginacion.component";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';



@Component({
  selector: 'app-lista-empresas',
  imports: [CommonModule, PaginacionComponent, FormsModule, MatCardModule],
  templateUrl: './lista-empresas.html',
  styleUrl: './lista-empresas.css',
})
export class ListaEmpresasComponent implements OnInit, OnDestroy {

  /*Variables para los datos provenientes de la DB*/
  empresas: Empresa[] = [];
  certificaciones: Certificaciones[] = [];
  empresaCertificacion: EmpresaCertificacion[] = [];
  clasesEmpresa = new Map<number, string>();
  certificacionesUnicas: Certificaciones[] = [];
  /*Array de objetos con la empresa y sus certificaciones correspondientes */
  listaEmpresas: IListaEmpresas[] = [];
  listaEmpresasPaginacion: IListaEmpresas[] = [];
  listaEmpresasFiltradas: IListaEmpresas[] = [];
  numElementos: number = 6;
  pagActual: number = 1;
  numPaginasTotal: number = 0;
  paginas: number[] = [];

  /*Loading skeleton*/
  loading: boolean = true;
  skeletonItems: number[] = Array.from({ length: 8 }, (_, i) => i + 1);

  /*Para desuscribirnos de los observables al destruirse el componente*/
  destroy$ = new Subject<void>();

  /*Dropdown toggles*/
  mostrarDropdownPuntuacion = false;
  mostrarDropdownCertificaciones = false;

  /*Varibales de filtros*/
  filtroSeleccionadoCertificacion: number = 0;
  filtroSeleccionadoPuntuacion: number = 0;
  filtroCertificacion: string = 'Todas las certificaciones';
  filtroPuntuacion: string = '';
  busqueda:string='';

  constructor(private empresaService: EmpresaService, private certificacionesService: CertificacionesService, private empresaCertificacionService: EmpresaCertificacionService, private route: Router) { }


  /*Nos treamos los datos necesarios de la DB*/
  ngOnInit(): void {
    this.obtenerDatos();

    //Evento de click para cerrar los dropdownss
    this.cerrarDropdown();
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
          this.loading = false;

        },
        error: (error) => {
          console.log(error);
          this.loading = false;
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
        certificacion: [],
        logo:valor.logo

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
    this.listaEmpresasFiltradas = this.listaEmpresas;

    
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

    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  /*Navegación al detalle de la empresa*/
  irEmpresa(id: number) {
    const ruta = 'empresas/empresa/' + id;
    this.route.navigate([ruta]);
  }



  toggleDropdownPuntuacion(): void {
    this.mostrarDropdownPuntuacion = !this.mostrarDropdownPuntuacion;
    this.mostrarDropdownCertificaciones = false;
  }

  toggleDropdownCertificaciones(): void {
    this.mostrarDropdownCertificaciones = !this.mostrarDropdownCertificaciones;
    this.mostrarDropdownPuntuacion = false;
  }

  cerrarDropdowns(): void {
    this.mostrarDropdownPuntuacion = false;
    this.mostrarDropdownCertificaciones = false;
  }

  /*Cogemos el valor de la certificación*/
  filtrarPorCertificacion(event: Event, id: number) {

    this.toggleDropdownCertificaciones();//Cerramos el dropdown

    //Cambiamos el background del elemnto seleccionado
    this.filtroSeleccionadoCertificacion = id;


    //Obtenemos el elemento seleccionado
    const elemento = event.target as HTMLElement;
    this.filtroCertificacion = elemento.textContent;

    //Filtramos
    this.filtrar();
  }

  /*Limpiar todos los filtros*/
  limpiarFiltros(): void {
    this.filtroSeleccionadoCertificacion = 0;
    this.filtroSeleccionadoPuntuacion = 0;
    this.filtroCertificacion = 'Todas las certificaciones';
    this.filtroPuntuacion = '';
    this.busqueda = '';
    this.listaEmpresasFiltradas = [...this.listaEmpresas];
  }

  /*Verificar si hay filtros activos*/
  tieneFiltrosActivos(): boolean {
    return this.filtroSeleccionadoCertificacion !== 0 || 
           this.filtroSeleccionadoPuntuacion !== 0 || 
           this.busqueda.trim() !== '';
  }

  /*Filtramos por valor de puntuación*/
  filtrarPorPuntuacion(event: Event, indice: number) {
    this.filtroSeleccionadoPuntuacion = indice;
    this.toggleDropdownPuntuacion()//Cerramos el toggle de la puntuación
    const elemento = event.target as HTMLElement;

    this.filtroPuntuacion = elemento.textContent.trim().toLowerCase();
   
    //Filtamos
    this.filtrar();
    

  }

  /*Método pra cerrar los dropdowns al evento click*/
  cerrarDropdown() {
    addEventListener('click', () => {

      this.cerrarDropdowns();
    });
  }

  //Método para filtrar según filtros
  filtrar() {
   
    switch (this.filtroPuntuacion) {
      case '80-100 (alta)':
        if(this.filtroCertificacion=='Todas las certificaciones') this.listaEmpresasFiltradas = this.listaEmpresas.filter(item => item.puntuacionSocial >= 80);

        else this.listaEmpresasFiltradas = this.listaEmpresas.filter(item => item.puntuacionSocial >= 80 && item.certificacion.includes(this.filtroCertificacion) && 
        (
          item.nombre.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.certificaciones?.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.empresaMatriz?.trim().toLowerCase().includes(this.busqueda.toLowerCase())
        )
      );
        
        break;
      case '50-79 (media)':
        if(this.filtroCertificacion=='Todas las certificaciones') this.listaEmpresasFiltradas = this.listaEmpresas.filter(item => item.puntuacionSocial >= 50 && item.puntuacionSocial < 80);

        else this.listaEmpresasFiltradas = this.listaEmpresas.filter(item => item.puntuacionSocial >= 50 && item.puntuacionSocial < 80 && item.certificacion.includes(this.filtroCertificacion) && 
        (
          item.nombre.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.certificaciones?.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.empresaMatriz?.trim().toLowerCase().includes(this.busqueda.toLowerCase())
        ));
        
        break;
      case '0-49 (baja)':
        if(this.filtroCertificacion=='Todas las certificaciones') this.listaEmpresasFiltradas = this.listaEmpresas.filter(item => item.puntuacionSocial >= 0 && item.puntuacionSocial < 50);

        else this.listaEmpresasFiltradas = this.listaEmpresas.filter(item => item.puntuacionSocial >= 0 && item.puntuacionSocial < 50 && item.certificacion.includes(this.filtroCertificacion) && 
        (
          item.nombre.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.certificaciones?.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.empresaMatriz?.trim().toLowerCase().includes(this.busqueda.toLowerCase())
        ));
        break;
      default:

      if(this.filtroCertificacion=='Todas las certificaciones') this.listaEmpresasFiltradas = this.listaEmpresas.filter(item =>
        (
          item.nombre.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.certificaciones?.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.empresaMatriz?.trim().toLowerCase().includes(this.busqueda.toLowerCase())
        ));
        
        else this.listaEmpresasFiltradas = this.listaEmpresas.filter(item => item.certificacion.includes(this.filtroCertificacion) && 
        (
          item.nombre.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.certificaciones?.trim().toLowerCase().includes(this.busqueda.toLowerCase()) ||
          item.empresaMatriz?.trim().toLowerCase().includes(this.busqueda.toLowerCase())
        ));
    };
    if(this.listaEmpresasFiltradas.length==0) this.listaEmpresasPaginacion=this.listaEmpresasFiltradas;
  }
  /*Desuscribirnos a los observables al destruirse los componentes*/
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
