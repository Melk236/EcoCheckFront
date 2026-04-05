import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../types/producto';
import { EmpresaService } from '../../../services/empresa.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-producto',
  imports: [CommonModule],
  templateUrl: './modal-producto.html',
  styleUrl: './modal-producto.css',
})
export class ModalProducto implements OnInit, OnDestroy {

  @Input() producto: Producto = {
    id: 0,
    marcaId: 0,
    categoria: '',
    descripcion: '',
    ecoScore: 0,
    usuarioId: 0,
    fechaActualizacion: new Date()
  };
  nombreEmpresa:string='';
  @Output() cerrar = new EventEmitter();
  @Output() irAldetalle=new EventEmitter<number>();
  destroy$ = new Subject<void>();
  constructor(private empresaService: EmpresaService,private router:Router) { }


  ngOnInit(): void {
    
    this.empresaService.getById(this.producto.marcaId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.nombreEmpresa = data.nombre;
      },
      error: (error) => {
        console.log(error.error.mensaje);
      }
    });
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

  getLabelTexto(ecoScore: number): string {
    if (ecoScore <= 40) {
      return 'Low';
    } else if (ecoScore < 80) {
      return 'Medium';
    } else {
      return 'Excellent';
    }
  }
  //Método para ir al detalle del producto en cuestión
  irAdetalles(){
    console.log(this.producto)
   this.irAldetalle.emit(this.producto.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
