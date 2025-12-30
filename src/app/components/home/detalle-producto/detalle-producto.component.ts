import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../services/producto.service';
import { ActivatedRoute } from '@angular/router';
import { Producto } from '../../../types/producto';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Material } from '../../../types/material';
import { MaterialService } from '../../../services/material.service';
import { EmpresaService } from '../../../services/empresa.service';
import { Empresa } from '../../../types/empresa';
import { PuntuacionService } from '../../../services/puntuacion.service';
import { Puntuacion } from '../../../types/puntuacion';
import { ModalDetalleComponent } from "../../modales/modal-detalle/modal-detalle.component";
import { NombreMaterialPipe } from '../../../shared/nombre-material-pipe';

@Component({
  selector: 'app-detalle-producto',
  imports: [CommonModule, ModalDetalleComponent, NombreMaterialPipe],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProductoComponent implements OnInit {

  //Variables
  producto: Producto = {
    id: 0,
    marcaId: 0,
    categoria: '',
    descripcion: '',
    ecoScore: 0,
    fechaActualizacion: new Date()
  }
  materiales: Material[] = [];
  materialesFormateados: string[] = [];
  puntuacion: Puntuacion = {
    id: 0,
    productoId: 0,
    fecha: new Date,
    valor: 0,
    valorAmbiental: 0,
    valorSocial: 0
  }
  marca: Empresa = {
    id: 0,
    nombre: '',
    puntuacionSocial: 0,
    descripcion: '',
    controversias: ''
  }

  //Manejo modales
  modal: boolean = false;
  modalInfoAmbiental: boolean = false;
  modalInfoSocial: boolean = false;
  //Creamos un Observable de tipos subject para desuscribir de los observables cuando este emita algo.
  destroy$ = new Subject<void>();

  constructor(private productoService: ProductoService, private materialService: MaterialService, private marcaService: EmpresaService, private puntuacionService: PuntuacionService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));//Obetenemos el id del producto de la url.

    this.obtenerProducto(id);//Lamamos al servicio para traerse el producto seleccionado
    this.obtenerMateriales(id);
    this.obtenerPuntuaciones(id);
  }

  obtenerProducto(id: number) {
    this.productoService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.producto = data;
        this.obtenerMarca();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  obtenerMateriales(id: number) {
    this.materialService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.materiales = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  obtenerMarca() {
    this.marcaService.getById(this.producto.marcaId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.marca = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  obtenerPuntuaciones(id: number) {
    this.puntuacionService.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        const puntuacion = data.find(item => item.productoId == id);

        if (puntuacion !== undefined) {
          this.puntuacion = puntuacion;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  formatNumber(ecoScore: number): string {

    return ecoScore.toFixed(0);

  }

  calcularOffset(ecoScore: number) {
    const totalLength: number = 100.53;

    return totalLength - (totalLength * ecoScore / 100);

  }

  /*
  Manejo del modal de los detalles del producto(abrir,cerrar)
  */
  abrirModal() {
    this.modal = true;
  }

  cerrarModal() {
    this.modal = false;
  }

  /*Lógica para manejo del mouseover y mouseout para la info de los ecoscores*/
  mostrarInfoAmbiental() {
    this.modalInfoAmbiental = true;
  }

  cerrarInfoAmbiental() {
    this.modalInfoAmbiental = false;

  }
  
  mostrarInfoSocial() {
    this.modalInfoSocial=true;
  }

  cerrarInfoSocial() {
    this.modalInfoSocial=false;
  }

  ngOnDestroy() {
    this.destroy$.next();//Nos desuscribimos de los observables del componente
    this.destroy$.complete();//Completamos este para que tambien ya no exista
  }

}
