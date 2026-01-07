import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpresaService } from '../../../services/empresa.service';
import { CertificacionesService } from '../../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../../services/empresa-certificacion.service';
import { Empresa } from '../../../types/empresa';
import { Certificaciones } from '../../../types/certificaciones';
import { EmpresaCertificacion } from '../../../types/empresa-certificacion';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../types/producto';
import { PaginacionComponent } from '../../../shared/paginacion/paginacion.component';



@Component({
  selector: 'app-empresa',
  imports: [CommonModule,PaginacionComponent],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class EmpresaComponent implements OnInit, OnDestroy {

  /*Variables manejo de datos porivenientes de la DB */
  empresa: Empresa = {
    id: 0,
    nombre: '',
    puntuacionSocial: 0,
    controversias: '',
    descripcion: ''
  }
  certificaciones: Certificaciones[] = [];
  empresaCertificacion: EmpresaCertificacion[] = [];
  certificacionEmpresa: { nombre: string, descripcion: string }[] = [];
  productos: Producto[] = [];
  productosEmpresa: Producto[] = [];
  productosEmpresaPaginados:Producto[]=[];
  /*Modal manejo del tooltip */
  modalInfoSocial: boolean = false;
  elementoSeleccionado: number = 0;

  /*Variable para manejar la vista del toggle*/
  vistaSeleccionada: number = 1;
  /*Observable que maneja la desuscripción del componente cuando se destruye el componente*/
  destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private empresaService: EmpresaService, private certificacionesService: CertificacionesService, private empresaCertificacionService: EmpresaCertificacionService, private productoService: ProductoService, private ruta: Router) { }



  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.obtenerDatos(id);
  }

  /*Obtenemos la empresa asociada al id con sus respectivas certificaciones */
  obtenerDatos(id: number) {
    forkJoin({
      empresa: this.empresaService.getById(id),
      certificaciones: this.certificacionesService.get(),
      empresaCertificacion: this.empresaCertificacionService.get()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {

        this.empresa = data.empresa;
        this.certificaciones = data.certificaciones;
        this.empresaCertificacion = data.empresaCertificacion;

        this.asociarEmpresaCertificaciones();

      },
      error: (error) => {
        console.log(error);
      }
    })

  }

  /*Asociamos la empresa con sus certificaciones si esta los tiene */
  asociarEmpresaCertificaciones() {
    //Rellenamos la listaEmpresa con los datos de la empresa correspondiente

    const empresaCertificacion = this.empresaCertificacion.filter(item => item.marcaId == this.empresa.id);

    if (empresaCertificacion === undefined) return;

    this.certificaciones.forEach((valor) => {
      const certificado = empresaCertificacion.find(item => item.certificacionId == valor.id);

      if (certificado !== undefined) {
        this.certificacionEmpresa.push({
          nombre: valor.nombre,
          descripcion: valor.descripcion
        });
      }

    });


  }
  /*Manejo del tooltip de la descripción de las certificaciones*/
  mostrarInfoSocial(indice: number) {
    this.elementoSeleccionado = indice;
    this.modalInfoSocial = true;

  }

  cerrarInfoSocial() {
    this.modalInfoSocial = false;
  }

  /*Método para el cambio de vista entre la info general y la vista de productos
  (indice 1:Info general,
  indice 2:Productos)*/
  cambiarToggle(indice: number) {
    
    if (indice == 2 && this.productos.length==0) this.obtenerProductos();
    this.vistaSeleccionada = indice;


  }

  /*Obtenemos los productos*/
  obtenerProductos() {
    this.productoService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.productos = data;
          //Cuando ya tengamos todos los productos filtramos los productos pertenecientes a la empresa correspondiente
          this.productosEmpresa = this.productos.filter(item => item.marcaId == this.empresa.id)
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  /*Navegación al detalle del producto*/
  abrirDetalle(idProducto: number) {
    const ruta = 'home/detalle-producto/';
    this.ruta.navigate([ruta, idProducto]);
  }

  /*Formateo de la el ecoScore de cada producto de la empresa */
  formatNumber(ecoScore: number): string {

    return ecoScore.toFixed(0);

  }
  /*Recibimos los elementos paginados del componente hijo */
  paginar(listaPaginada:Producto[]){
    setTimeout(() => {
      this.productosEmpresaPaginados=listaPaginada;  
    }, 0);
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
