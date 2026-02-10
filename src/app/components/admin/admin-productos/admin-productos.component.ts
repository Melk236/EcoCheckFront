import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../types/producto';
import { PaginacionComponent } from '../../../shared/paginacion/paginacion.component';
import { ModalConfirmarComponent } from '../../modales/modal-confirmar/modal-confirmar.component';

@Component({
  selector: 'app-admin-productos',
  imports: [CommonModule, FormsModule, PaginacionComponent, ModalConfirmarComponent],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css',
})
export class AdminProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosPaginados: Producto[] = [];

  busqueda: string = '';
  categoriaFiltro: string = '';
  ecoScoreFiltro: string = '';

  categorias: string[] = ['Higiene', 'Alimentacion', 'Hogar', 'Electronica', 'Ropa', 'Cosmetica'];
  ecoScores: string[] = ['Alto (80+)', 'Medio (50-79)', 'Bajo (0-49)'];

  modalEliminarOpen: boolean = false;
  productoAEliminar: Producto | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarModalExito: boolean = false;
  mostrarModalError: boolean = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.get().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = [...this.productos];
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarMensajeError('Error al cargar los productos');
      }
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.productos];

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino) ||
        p.categoria?.toLowerCase().includes(termino)
      );
    }

    if (this.categoriaFiltro) {
      filtrados = filtrados.filter(p => p.categoria === this.categoriaFiltro);
    }

    if (this.ecoScoreFiltro) {
      filtrados = filtrados.filter(p => {
        if (this.ecoScoreFiltro === 'Alto (80+)') return p.ecoScore >= 80;
        if (this.ecoScoreFiltro === 'Medio (50-79)') return p.ecoScore >= 50 && p.ecoScore < 80;
        if (this.ecoScoreFiltro === 'Bajo (0-49)') return p.ecoScore < 50;
        return true;
      });
    }

    this.productosFiltrados = filtrados;
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onCategoriaChange(): void {
    this.aplicarFiltros();
  }

  onEcoScoreChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaFiltro = '';
    this.ecoScoreFiltro = '';
    this.aplicarFiltros();
  }

  paginar(lista: Producto[]): void {
    setTimeout(() => {
     this.productosPaginados = lista;   
    }, 0);
   
  }

  abrirModalEliminar(producto: Producto): void {
    this.productoAEliminar = producto;
    this.modalEliminarOpen = true;
  }

  confirmarEliminar(): void {
    if (this.productoAEliminar && this.productoAEliminar.id) {
      this.productoService.delete(this.productoAEliminar.id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== this.productoAEliminar!.id);
          this.aplicarFiltros();
          this.modalEliminarOpen = false;
          this.productoAEliminar = null;
          this.mostrarMensajeExito('Producto eliminado correctamente');
        },
        error: (err: any) => {
          console.error('Error al eliminar producto:', err);
          this.modalEliminarOpen = false;
          this.productoAEliminar = null;
          this.mostrarMensajeError('Error al eliminar el producto');
        }
      });
    }
  }

  cerrarModalEliminar(): void {
    this.modalEliminarOpen = false;
    this.productoAEliminar = null;
  }

  mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mostrarModalExito = true;
    setTimeout(() => this.mostrarModalExito = false, 3000);
  }

  mostrarMensajeError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mostrarModalError = true;
    setTimeout(() => this.mostrarModalError = false, 3000);
  }

  cerrarModalExito(): void {
    this.mostrarModalExito = false;
  }

  cerrarModalError(): void {
    this.mostrarModalError = false;
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }

  getCategoriaClass(categoria: string): string {
    const classes: { [key: string]: string } = {
      'Higiene': 'bg-[#e8f5e9] dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'Alimentacion': 'bg-[#fff3e0] dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'Hogar': 'bg-[#e3f2fd] dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'Electronica': 'bg-[#f3e5f5] dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'Ropa': 'bg-[#fce4ec] dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      'Cosmetica': 'bg-[#fff8e1] dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    };
    return classes[categoria] || 'bg-[#f6f8f6] dark:bg-gray-800 text-[#111814] dark:text-gray-300';
  }
}
