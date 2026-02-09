import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-modal-confirmar',
  templateUrl: './modal-confirmar.html',
  styleUrl: './modal-confirmar.css'
})
export class ModalConfirmarComponent {
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Input() mensaje: string = '';
  @Input() tipo: string = 'borrar';

  getColor(): string {
    return this.tipo === 'actualizar' ? '#eab308' : '#ee4b2b';
  }

  getIcono(): string {
    return this.tipo === 'actualizar' ? 'edit' : 'warning';
  }

  getTitulo(): string {
    return this.tipo === 'actualizar' ? '¿Actualizar?' : '¿Eliminar?';
  }

  

  getBoton(): string {
    return this.tipo === 'actualizar' ? 'Actualizar' : 'Eliminar';
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
