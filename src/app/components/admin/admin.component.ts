import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProductosComponent } from "./admin-productos/admin-productos.component";
import { AdminUsuariosComponent } from "./admin-usuarios/admin-usuarios.component";

@Component({
  selector: 'app-admin',
  imports: [CommonModule, AdminProductosComponent, AdminUsuariosComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {
  vistaActual: 'productos' | 'usuarios' = 'productos';

  cambiarVista(vista: 'productos' | 'usuarios'): void {
    this.vistaActual = vista;
  }

  getProductoClasses(): string {
    return this.vistaActual === 'productos'
      ? 'bg-white text-black shadow-sm dark:bg-gray-600 dark:text-white'
      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600';
  }

  getUsuarioClasses(): string {
    return this.vistaActual === 'usuarios'
      ? 'bg-white text-black shadow-sm dark:bg-gray-600 dark:text-white'
      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600';
  }
}
