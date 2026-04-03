import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Producto } from '../../../types/producto';
import { EmpresaService } from '../../../services/empresa.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-modal-producto',
  imports: [],
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

  destroy$ = new Subject<void>();
  constructor(private empresaService: EmpresaService) { }


  ngOnInit(): void {
    console.log('Hollaaaaaa mundoooooooooooooo')
    this.empresaService.getById(this.producto.marcaId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.nombreEmpresa = data.nombre;
      },
      error: (error) => {
        console.log(error.error.mensaje);
      }
    });
  }


  /*Método que con el deocrador output eite un evento para que el componente padre lo capture
  y cierre el modal */
  cancelar() {
    this.cerrar.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
