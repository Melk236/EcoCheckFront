import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal-informativo',
  imports: [],
  templateUrl: './modal-informativo.html',
  styleUrl: './modal-informativo.css',
})
export class ModalInformativo  {
  //Mensaje de error de las operaciones del componente padre
  @Input() messageError:string='';
  @Input() success:boolean=false;
  @Output() closeModal=new EventEmitter<void>();
  closing: boolean = false;

  
  /*Para cerrar el modal en el componente padre */
  cerrarModal(){
    this.closing = true;
    setTimeout(() => {
      this.closeModal.emit();
    }, 150);
  }
}
