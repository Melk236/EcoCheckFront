import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../services/producto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Producto } from '../../../types/producto';
import { Subject, take, takeUntil } from 'rxjs';
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

  producto: Producto = {
    id: 0,
    marcaId: 0,
    categoria: '',
    descripcion: '',
    ecoScore: 0,
    fechaActualizacion: new Date()
  }
  productos: Producto[] = [];
  cargaAlternativas: boolean = false;
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

  modal: boolean = false;
  modalInfoAmbiental: boolean = false;
  modalInfoSocial: boolean = false;
  mostrarAlternativas: boolean = false;
  destroy$ = new Subject<void>();

  constructor(private productoService: ProductoService, private materialService: MaterialService, private marcaService: EmpresaService, private puntuacionService: PuntuacionService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.obtenerProducto(id);
        this.obtenerMateriales(id);
        this.obtenerPuntuaciones(id);
        this.productos=[];
        this.mostrarAlternativas=false;
      }
    });

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

  getPorcentajeAumento(ecoScoreAlternativa: number): string {
    const diferencia = ecoScoreAlternativa - this.producto.ecoScore;
    const porcentaje = (diferencia / this.producto.ecoScore) * 100;
    return '+' + porcentaje.toFixed(0) + '%';
  }

  getColorClase(ecoScore: number): string {
    if (ecoScore <= 40) {
      return 'text-red-500 dark:text-red-400';
    } else if (ecoScore < 80) {
      return 'text-yellow-500 dark:text-yellow-400';
    } else {
      return 'text-green-500 dark:text-green-400';
    }
  }

  getBgColorClase(ecoScore: number): string {
    if (ecoScore <= 40) {
      return 'bg-red-500';
    } else if (ecoScore < 80) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }

  scroll(id: string) {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  abrirModal() {
    this.modal = true;
  }

  cerrarModal() {
    this.modal = false;
  }

  mostrarInfoAmbiental() {
    this.modalInfoAmbiental = true;
  }

  cerrarInfoAmbiental() {
    this.modalInfoAmbiental = false;
  }

  mostrarInfoSocial() {
    this.modalInfoSocial = true;
  }

  cerrarInfoSocial() {
    this.modalInfoSocial = false;
  }

  obetnerMejoresProductos() {
    if (this.cargaAlternativas) {
      this.mostrarAlternativas = !this.mostrarAlternativas;
      if (this.mostrarAlternativas) this.scroll('alternativas')
      return;
    }

    const categoria = this.producto.categoria.split(',');
    
    this.productoService.getComparacion(categoria, this.producto.ecoScore).
      pipe(takeUntil(this.destroy$)).
      subscribe({
        next: (data) => {
          this.productos = data;
          this.mostrarAlternativas = true;
          this.cargaAlternativas = true;
          this.scroll('alternativas');
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  abrirDetalle(id: number) {

    this.router.navigate(['home/detalle-producto', id]);

  }
 
    
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
