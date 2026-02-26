import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { RolService } from '../../../services/rol.service';
import { User } from '../../../types/user';
import { Rol } from '../../../types/rol';
import { PaginacionComponent } from '../../../shared/paginacion/paginacion.component';
import { ModalConfirmarComponent } from '../../modales/modal-confirmar/modal-confirmar.component';
import { AlertaComponent } from '../../modales/alerta/alerta.component';
import { environment } from '../../../environment/environment';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-usuarios',
  imports: [CommonModule, FormsModule, PaginacionComponent, ModalConfirmarComponent, AlertaComponent, MatCardModule],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css',
})
export class AdminUsuariosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('fechaInput') fechaInput!: ElementRef<HTMLInputElement>;
  private urlImagen = environment.imagenUrl;
  
  usuarios: User[] = [];
  usuariosFiltrados: User[] = [];
  usuariosPaginados: User[] = [];

  busqueda: string = '';
  rolFiltro: string = '';
  fechaFiltro: string = '';

  roles: Rol[] = [];

  modalEliminarOpen: boolean = false;
  usuarioAEliminar: User | null = null;

  mensajeAlerta: string = '';
  esExitoAlerta: boolean = false;

  /*Loading skeleton*/
  loading: boolean = true;
  skeletonItems: number[] = Array.from({ length: 5 }, (_, i) => i + 1);

  constructor(
    private userService: UserService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
  }

  cargarRoles(): void {
    this.rolService.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
      }
    });
  }

  cargarUsuarios(): void {
    this.userService.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...this.usuarios];
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.mostrarAlerta('Error al cargar los usuarios', false);
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.usuarios];

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(u =>
        u.userName?.toLowerCase().includes(termino) ||
        u.email?.toLowerCase().includes(termino) ||
        u.nombre?.toLowerCase().includes(termino)
      );
    }

    if (this.rolFiltro) {
      filtrados = filtrados.filter(u => u.roleName === this.rolFiltro);
    }

    if (this.fechaFiltro) {
      const fechaFiltro = new Date(this.fechaFiltro);
      filtrados = filtrados.filter(u => {
        if (!u.fechaRegistro) return false;
        const fechaUsuario = new Date(u.fechaRegistro);
        return fechaUsuario.toDateString() === fechaFiltro.toDateString();
      });
    }

    this.usuariosFiltrados = filtrados;
    if(this.usuariosFiltrados.length==0) this.usuariosPaginados=[...this.usuariosFiltrados];
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  onRolChange(): void {
    this.aplicarFiltros();
  }

  onFechaChange(): void {
    this.aplicarFiltros();
  }

  focusFecha(): void {
    if (this.fechaInput?.nativeElement) {
      this.fechaInput.nativeElement.showPicker?.();
      this.fechaInput.nativeElement.focus();
    }
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.rolFiltro = '';
    this.fechaFiltro = '';
    this.aplicarFiltros();
  }

  paginar(lista: User[]): void {
    setTimeout(() => {
      this.usuariosPaginados = lista;
    }, 0);
  }

  abrirModalEliminar(usuario: User): void {
    this.usuarioAEliminar = usuario;
    this.modalEliminarOpen = true;
  }

  confirmarEliminar(): void {
    if (this.usuarioAEliminar && this.usuarioAEliminar.id) {
      this.userService.delete(this.usuarioAEliminar.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioAEliminar!.id);
          this.aplicarFiltros();
          this.modalEliminarOpen = false;
          this.usuarioAEliminar = null;
          this.mostrarAlerta('Usuario eliminado correctamente', true);
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.modalEliminarOpen = false;
          this.usuarioAEliminar = null;
          this.mostrarAlerta('Error al eliminar el usuario', false);
        }
      });
    }
  }

  cerrarModalEliminar(): void {
    this.modalEliminarOpen = false;
    this.usuarioAEliminar = null;
  }

  mostrarAlerta(mensaje: string, esExito: boolean): void {
    this.mensajeAlerta = mensaje;
    this.esExitoAlerta = esExito;
  }

  cerrarAlerta(): void {
    this.mensajeAlerta = '';
  }

  getUsername(usuario: User): string {
    return usuario.userName || usuario.nombre || 'Sin nombre';
  }

  getAvatarUrl(usuario: User): string {
    if (usuario.urlImagen) {
      return this.urlImagen + usuario.urlImagen;
    }
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3ORf-FnudDaA1NzV5UvdmmzQpCofGyUeOmYqp59ZNzqs1Q0RlfF8qKyHUGrT-qJ8sPqHw1W3pMc948xO59s3AY4HAcV0uzJTUGuRd0j4ryP79b2Ddxlj8QMyI-yz_19Owq5mFLjVy8uhsmLW5qKQagIIedD5UcDa7QxihO4CUOStI4iqITk6jTR1CEyAoZCDmve56S8lZEjHbWqF2N5A0LTTX4vZJSYO2s65GdC51X5_avEfz4KPExWa-wKb_VqxqS9-lC0GX8wn3';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
