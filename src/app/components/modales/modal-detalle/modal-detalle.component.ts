import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { Puntuacion } from '../../../types/puntuacion';
import { Material } from '../../../types/material';

@Component({
  selector: 'app-modal-detalle',
  imports: [],
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
}
