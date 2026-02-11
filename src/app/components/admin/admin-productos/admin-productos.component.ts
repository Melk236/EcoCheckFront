import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { MaterialService } from '../../../services/material.service';
import { Producto } from '../../../types/producto';
import { ProductoConMateriales } from '../../../types/producto-con-materiales';
import { PaginacionComponent } from '../../../shared/paginacion/paginacion.component';
import { ModalConfirmarComponent } from '../../modales/modal-confirmar/modal-confirmar.component';
import { AlertaComponent } from '../../modales/alerta/alerta.component';

@Component({
  selector: 'app-admin-productos',
  imports: [CommonModule, FormsModule, PaginacionComponent, ModalConfirmarComponent, AlertaComponent],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css',
})
export class AdminProductosComponent implements OnInit {
  productos: ProductoConMateriales[] = [];
  productosFiltrados: ProductoConMateriales[] = [];
  productosPaginados: ProductoConMateriales[] = [];

  busqueda: string = '';
  materialFiltro: string = '';
  ecoScoreFiltro: string = '';
  fechaFiltro: string = '';

  materiales: string[] = [];
  ecoScores: string[] = ['Alto (80+)', 'Medio (50-79)', 'Bajo (0-49)'];

  modalEliminarOpen: boolean = false;
  productoAEliminar: Producto | null = null;

  mensajeAlerta: string = '';
  esExitoAlerta: boolean = false;

  constructor(
    private productoService: ProductoService,
    private materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }


  cargarProductos(): void {
    this.productoService.get().subscribe({
      next: (data) => {
        this.productos = data.map(p => ({ ...p, materiales: [] }));
        this.productosFiltrados = [...this.productos];
        this.cargarMaterialesPorProducto();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarAlerta('Error al cargar los productos', false);
      }
    });
  }

  cargarMaterialesPorProducto(): void {
    let materialesCargados = 0;
    this.productos.forEach(producto => {
      if (producto.id) {
        this.materialService.getById(producto.id).subscribe({
          next: (materiales) => {
            producto.materiales = materiales;
            materialesCargados++;
            if (materialesCargados === this.productos.length) {
              this.extraerMaterialesUnicos();
            }
          },
          error: (err) => {
            console.error('Error al cargar materiales para producto:', err);
            materialesCargados++;
            if (materialesCargados === this.productos.length) {
              this.extraerMaterialesUnicos();
            }
          }
        });
      } else {
        materialesCargados++;
        if (materialesCargados === this.productos.length) {
          this.extraerMaterialesUnicos();
        }
      }
    });
  }

  extraerMaterialesUnicos(): void {
    const todosMateriales: string[] = [];
    this.productos.forEach(producto => {
      producto.materiales?.forEach(m => {
        if (m.nombre) {
          todosMateriales.push(m.nombre);
        }
      });
    });
    this.materiales = [...new Set(todosMateriales)].sort();
  }

  aplicarFiltros(): void {
    let filtrados = [...this.productos];

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino) ||
        p.categoria?.toLowerCase().includes(termino) ||
        p.materiales?.some(m => m.nombre?.toLowerCase().includes(termino))
      );
    }

    if (this.materialFiltro) {
      filtrados = filtrados.filter(p =>
        p.materiales?.some(m => m.nombre === this.materialFiltro)
      );
    }

    if (this.ecoScoreFiltro) {
      filtrados = filtrados.filter(p => {
        if (this.ecoScoreFiltro === 'Alto (80+)') return p.ecoScore >= 80;
        if (this.ecoScoreFiltro === 'Medio (50-79)') return p.ecoScore >= 50 && p.ecoScore < 80;
        if (this.ecoScoreFiltro === 'Bajo (0-49)') return p.ecoScore < 50;
        return true;
      });
    }

    if (this.fechaFiltro) {
      const fechaFiltro = new Date(this.fechaFiltro);
      filtrados = filtrados.filter(p => {
        if (!p.fechaActualizacion) return false;
        const fechaProducto = new Date(p.fechaActualizacion);
        return fechaProducto.toDateString() === fechaFiltro.toDateString();
      });
    }

    this.productosFiltrados = filtrados;
    if (this.productosFiltrados.length === 0) {
      this.productosPaginados.splice(0, 1);
    }
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onMaterialChange(): void {
    this.aplicarFiltros();
  }

  onEcoScoreChange(): void {
    this.aplicarFiltros();
  }

  onFechaChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.materialFiltro = '';
    this.ecoScoreFiltro = '';
    this.fechaFiltro = '';
    this.aplicarFiltros();
  }

  paginar(lista: ProductoConMateriales[]): void {
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
          this.mostrarAlerta('Producto eliminado correctamente', true);
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error.error.mensaje);
          this.modalEliminarOpen = false;
          this.productoAEliminar = null;
          this.mostrarAlerta('Error al eliminar el producto', false);
        }
      });
    }
  }

  cerrarModalEliminar(): void {
    this.modalEliminarOpen = false;
    this.productoAEliminar = null;
  }

  mostrarAlerta(mensaje: string, esExito: boolean): void {
    this.mensajeAlerta = mensaje;
    this.esExitoAlerta = esExito;
  }

  cerrarAlerta(): void {
    this.mensajeAlerta = '';
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }

  getMaterialesStr(producto: ProductoConMateriales): string {
    if (!producto.materiales || producto.materiales.length === 0) return 'Sin materiales';
    return producto.materiales.map(m => m.nombre).join(', ');
  }

  getEcoScoreClass(ecoScore: number): string {
    if (ecoScore > 80) return 'text-green-600 dark:text-green-400';
    if (ecoScore > 50) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-orange-500 dark:text-orange-400';
  }
}
