import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Puntuacion } from '../../../types/puntuacion';
import { Material } from '../../../types/material';
import { CommonModule } from '@angular/common';
import { NombreMaterialPipe } from '../../../shared/nombre-material-pipe';
import { Producto } from '../../../types/producto';


@Component({
  selector: 'app-modal-detalle',
  imports: [CommonModule,NombreMaterialPipe],
  templateUrl: './modal-detalle.html',
  styleUrl: './modal-detalle.css',
})
export class ModalDetalleComponent implements OnInit {
  @Input() puntuacion:Puntuacion={
    id: 0,
    productoId: 0,
    fecha: new Date(),
    valor: 0,
    valorAmbiental: 0,
    valorSocial: 0
  }
  @Input() materiales:Material[]=[];
  @Input() producto:Producto={
    id: 0,
    marcaId: 0,
    categoria: '',
    descripcion: '',
    ecoScore: 0,
    fechaActualizacion: new Date()
  }
  @Output() closeModal=new EventEmitter<void>();

  constructor(){}
  ngOnInit(): void {
   console.log(this.puntuacion);
   console.table(this.materiales)
  }

  /*Emitimos el evento al padre para que se cierre el modal */
  cerrarModal(){
    this.closeModal.emit();
  }

  /*Formateo de los valores */
  formatNumber(ecoScore:number):string{
    return ecoScore.toFixed(0);
  }
}
