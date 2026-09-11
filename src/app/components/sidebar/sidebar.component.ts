import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../types/user';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../environment/environment';
import { SharedService } from '../../services/shared-service.service';
import { Subject, takeUntil, switchMap, startWith, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  isLargeScreen = false;
  sidebarAbierto = false;
  usuario: User = {
    id: 0,
    userName: '',
    roleName: ''
  }
  imagenUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHLdsiS9dq6Rw-7AGCek6S_kGx5ORZjUUl6gYWpmcoQgQgJxf85gOXxdYeCuslnDUgMP0s4H9PzyX3JxwRctFgWEcqDbHZtG1VHsWvGK7PCZZI2l-Jcacl3vW03P45-mnhV7bTnXy_Y6X3ofgZtIf2QAHgmFTX3hVPrwWyV5IQhTsavrryAYPGkZgPy5etb2whyYj_d5jNEGm36qLqwG84mEjxTWFUFb4Y3HfQbflhBN_hguNpntKjmHZwTwnR-uNomyeASTx3VOmX';

  destroy$ = new Subject<void>();
  constructor(private router: Router, private profileService: ProfileService, private sharedService: SharedService, private authService: AuthService) { }


  ngOnInit(): void {
    this.checkScreenSize();
    this.suscribirCambiosPerfil();
    this.cerrarSidebarAlNavegar();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuButton && userDropdown) {
      if (!userMenuButton.contains(target) && !userDropdown.contains(target)) {
        this.dropdownOpen = false;
      }
    }
  }

  checkScreenSize() {
    this.isLargeScreen = window.innerWidth >= 1024;
    if (this.isLargeScreen) {
      this.sidebarAbierto = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebar(): void {
    this.sidebarAbierto = false;
  }

  /*Cierra el drawer móvil al navegar, replicando el auto-cierre de Flowbite*/
  private cerrarSidebarAlNavegar(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.cerrarSidebar());
  }

  mostrarSidebar(): boolean {
    return this.isLargeScreen;
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }


  /*Carga el perfil al iniciar y se resuscribe ante cada emisión de cambiarPerfil$.
    Se invalida la caché del ProfileService (restoreUser) para forzar una petición HTTP nueva,
    ya que getUser() usa shareReplay y devolvería datos obsoletos*/
  suscribirCambiosPerfil(): void {
    this.sharedService.cambiarPerfil$.pipe(
      startWith(null),
      switchMap(() => {
        this.profileService.restoreUser();
        return this.profileService.getUser();
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.usuario = data;
        this.imagenUrl = environment.imagenUrl + this.usuario.urlImagen;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  darkMode(): boolean {

    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (darkMode) return true;
    
    return false;
  }
  /*Cierre de sesión del usuario */
  cerrarSesion() {
    this.authService.removeToken();
    //Restauramos los datos del usuario a null
    this.profileService.restoreUser();
    this.authService.logOut().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.router.navigate(['login']);
      },
      error: (error) => {
        console.log(error.error.mensaje);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
