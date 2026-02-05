import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.html',
  styleUrl: './alerta.css'
})
export class AlertaComponent implements OnChanges {
  @Input() mensajeError: string = '';
  @Input() esExito: boolean = false;
  @Input() posicion: string = 'top-4';
  closing: boolean = false;

  @Output() closeModal = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mensajeError'] && this.mensajeError === '') {
      this.cerrarModal();
    }
  }

  cerrarModal() {
    this.closing = true;
    setTimeout(() => {
      this.closeModal.emit();
      this.closing = false;
    }, 180);
  }
}
