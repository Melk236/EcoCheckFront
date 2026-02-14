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
  certificacionesUnicas: Certificaciones[] = [];
  /*Array de objetos con la empresa y sus certificaciones correspondientes */
  listaEmpresas: IListaEmpresas[] = [];
  listaEmpresasPaginacion: IListaEmpresas[] = [];
  listaEmpresasFiltradas: IListaEmpresas[] = [];
  numElementos: number = 6;
  pagActual: number = 1;
  numPaginasTotal: number = 0;
  paginas: number[] = [];

  /*Para desuscribirnos de los observables al destruirse el componente*/
  destroy$ = new Subject<void>();

  /*Dropdown toggles*/
  mostrarDropdownPuntuacion = false;
  mostrarDropdownCertificaciones = false;
  filtroSeleccionados: number = 0;

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

  /*Filtramos por  certificación*/
  filtrarPorCertificacion(event: Event, id: number) {

    this.toggleDropdownCertificaciones();//Cerramos el dropdown

    //Cambiamos el background del elemnto seleccionado
    this.filtroSeleccionados = id;
    this.listaEmpresasFiltradas = this.listaEmpresas;

    //Obtenemos el elemento seleccionado
    const elemento = event.target as HTMLElement;
    const valor = elemento.textContent;


    if (valor.trim().toLowerCase() == 'todas las certificaciones') {
      this.listaEmpresasFiltradas = this.listaEmpresas;
      return;
    }

    //Filtramos el array original y se lo asignamos al array filtrado
    this.listaEmpresasFiltradas = this.listaEmpresas.filter(item =>
      item.certificacion.includes(valor));
    this.listaEmpresasPaginacion = this.listaEmpresasFiltradas;


  }

  /*Filtramos por  puntuación*/
  filtrarPorPuntuacion(event: Event) {
    this.toggleDropdownPuntuacion()//Cerramos el toggle de la puntuación
    const elemento = event.target as HTMLElement;

    const valor = elemento.textContent.trim().toLowerCase();
    
    switch(valor){
      case '80-100 (alta)':
        this.listaEmpresasFiltradas=this.listaEmpresas.filter(item=>item.puntuacionSocial>=80);
        break;
      case '50-79 (media)':
        this.listaEmpresasFiltradas=this.listaEmpresas.filter(item=>item.puntuacionSocial>=50 &&item.puntuacionSocial<80);
        break;
      case '0-49 (baja)':
        this.listaEmpresasFiltradas=this.listaEmpresas.filter(item=>item.puntuacionSocial>=0 && item.puntuacionSocial<50);

    }
    
    
  }
  /*Método pra cerrar los dropdowns al evento click*/
  cerrarDropdown(){
    addEventListener('click',()=>{
      
      this.cerrarDropdowns();
    });
  }
  /*Desuscribirnos a los observables al destruirse los componentes*/
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
