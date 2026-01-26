import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.html',
  styleUrl: './alerta.css'
})
export class AlertaComponent {
  @Input() mensajeError: string = '';
  closing: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  cerrarModal() {
    this.closing = true;
    setTimeout(() => this.closeModal.emit(), 180);
  }
}
