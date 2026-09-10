import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { ProductoService } from '../../services/producto.service';
import { MaterialService } from '../../services/material.service';
import { User } from '../../types/user';
import { Producto } from '../../types/producto';
import { Material } from '../../types/material';

interface ConteoMensual {
  mes: number;
  anio: number;
}

const CO2_REFERENCIA_KG = 8;
const FACTOR_EQUIVALENCIA_KM_POR_KG_CO2 = 4;

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit, OnDestroy {

  usuario: User | null = null;
  productos: Producto[] = [];
  mediaEcoScore: number = 0;
  porcentajeDelTotal: number = 0;
  diferenciaEsteMes: number = 0;
  co2AhorradoTotal: number = 0;
  loading: boolean = true;
  skeletonResumen: number[] = [1, 2, 3];
  skeletonProductos: number[] = [1, 2, 3, 4];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly profileService: ProfileService,
    private readonly productoService: ProductoService,
    private readonly materialService: MaterialService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarUsuario(): void {
    this.profileService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.usuario = user;
          this.cargarProductosDelUsuario();
        },
        error: (err) => console.error('Error al cargar usuario:', err),
      });
  }

  private cargarProductosDelUsuario(): void {
    this.productoService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (todosLosProductos) => this.procesarProductosDelUsuario(todosLosProductos),
        error: (err) => console.error('Error al cargar productos:', err),
      });
  }

  private procesarProductosDelUsuario(todosLosProductos: Producto[]): void {
    this.productos = this.filtrarProductosDelUsuarioActual(todosLosProductos);
    this.porcentajeDelTotal = this.calcularPorcentajeDelTotal(this.productos, todosLosProductos.length);
    this.mediaEcoScore = this.calcularMediaEcoScore(this.productos);
    this.diferenciaEsteMes = this.calcularDiferenciaMensual(this.productos, new Date());
    this.cargarCo2DeProductos();
  }

  private filtrarProductosDelUsuarioActual(productos: Producto[]): Producto[] {
    const userId = this.usuario?.id;
    return userId === undefined ? [] : productos.filter(p => p.usuarioId === userId);
  }

  private calcularMediaEcoScore(productos: Producto[]): number {
    if (!productos.length) return 0;
    const suma = productos.reduce((acc, p) => acc + (p.ecoScore ?? 0), 0);
    return this.redondearADecimales(suma / productos.length, 1);
  }

  private calcularPorcentajeDelTotal(productosDelUsuario: Producto[], totalProductos: number): number {
    if (!totalProductos) return 0;
    return this.redondearADecimales((productosDelUsuario.length / totalProductos) * 100, 1);
  }

  private calcularDiferenciaMensual(productos: Producto[], referencia: Date): number {
    const mesActual = this.construirConteoMensual(referencia);
    const mesAnterior = this.construirMesAnterior(mesActual);

    const productosEsteMes = this.contarProductosEnMes(productos, mesActual);
    const productosMesPasado = this.contarProductosEnMes(productos, mesAnterior);

    return productosEsteMes - productosMesPasado;
  }

  private construirConteoMensual(fecha: Date): ConteoMensual {
    return { mes: fecha.getMonth(), anio: fecha.getFullYear() };
  }

  private construirMesAnterior({ mes, anio }: ConteoMensual): ConteoMensual {
    if (mes === 0) return { mes: 11, anio: anio - 1 };
    return { mes: mes - 1, anio };
  }

  private contarProductosEnMes(productos: Producto[], { mes, anio }: ConteoMensual): number {
    return productos.filter(p => {
      if (!p.fechaActualizacion) return false;
      const fecha = new Date(p.fechaActualizacion);
      return fecha.getMonth() === mes && fecha.getFullYear() === anio;
    }).length;
  }

  private cargarCo2DeProductos(): void {
    if (!this.productos.length) {
      this.co2AhorradoTotal = 0;
      this.loading = false;
      return;
    }

    const peticiones = this.productos.map(p =>
      this.materialService.getById(p.id).pipe(takeUntil(this.destroy$))
    );

    forkJoin(peticiones).subscribe({
      next: (resultados) => {
        this.co2AhorradoTotal = this.calcularCo2Ahorrado(resultados);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar impacto de carbono:', err);
        this.loading = false;
      },
    });
  }

  private calcularCo2Ahorrado(materialesPorProducto: Material[][]): number {
    const suma = materialesPorProducto.reduce((acc, materiales) => {
      if (!materiales?.length) return acc;
      const co2Producto = materiales.reduce(
        (sub, m) => sub + (m.impactoCarbono || 0), 0
      );
      return acc + Math.max(0, CO2_REFERENCIA_KG - co2Producto);
    }, 0);
    return this.redondearADecimales(suma, 1);
  }

  private redondearADecimales(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
  }

  irADetalleProducto(productoId: number): void {
    this.router.navigate(['/productos/detalle-producto', productoId]);
  }

  protected readonly FACTOR_EQUIVALENCIA_KM_POR_KG_CO2 = FACTOR_EQUIVALENCIA_KM_POR_KG_CO2;
}
