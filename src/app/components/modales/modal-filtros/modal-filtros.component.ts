import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-filtros',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-filtros.html',
  styleUrl: './modal-filtros.css'
})
export class ModalFiltrosComponent {
  @Output() close = new EventEmitter<void>();
  @Output() aplicarFiltros = new EventEmitter<{pais: string, puntuacion: string}>();

  paisSeleccionado: string = '';
  puntuacionSeleccionada: string = '';

  paises: string[] = [
    'España',
    'Francia',
    'Alemania',
    'Italia',
    'Portugal',
    'Reino Unido',
    'Estados Unidos',
    'China',
    'Brasil',
    'Argentina',
    'México',
    'Colombia',
    'Chile',
    'Perú',
    'Japón',
    'Corea del Sur',
    'India',
    'Australia',
    'Canadá'
  ];

  puntuaciones: string[] = [
    'Todas',
    '80-100 (Alta)',
    '50-79 (Media)',
    '0-49 (Baja)'
  ];

  cerrar(): void {
    this.close.emit();
  }

  aplicar(): void {
    this.aplicarFiltros.emit({
      pais: this.paisSeleccionado,
      puntuacion: this.puntuacionSeleccionada
    });
    this.cerrar();
  }

  limpiar(): void {
    this.paisSeleccionado = '';
    this.puntuacionSeleccionada = '';
  }
}
