import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../types/user';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../environment/environment';
import { SharedService } from '../../services/shared-service.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit,OnDestroy {
  dropdownOpen = false;
  isLargeScreen = false;
  usuario:User={
    id: 0,
    userName: '',
    roleName: ''
  }
  imagenUrl='https://lh3.googleusercontent.com/aida-public/AB6AXuBHLdsiS9dq6Rw-7AGCek6S_kGx5ORZjUUl6gYWpmcoQgQgJxf85gOXxdYeCuslnDUgMP0s4H9PzyX3JxwRctFgWEcqDbHZtG1VHsWvGK7PCZZI2l-Jcacl3vW03P45-mnhV7bTnXy_Y6X3ofgZtIf2QAHgmFTX3hVPrwWyV5IQhTsavrryAYPGkZgPy5etb2whyYj_d5jNEGm36qLqwG84mEjxTWFUFb4Y3HfQbflhBN_hguNpntKjmHZwTwnR-uNomyeASTx3VOmX';

  destroy$=new Subject<void>();
  constructor(private router: Router,private profileService:ProfileService,private sharedService:SharedService,private authService:AuthService) { }
  

  ngOnInit(): void {
    this.checkScreenSize();
    this.cargarPerfil();
    this.actualizarPerfil();
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
  }

  mostrarSidebar(): boolean {
    return this.isLargeScreen;
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  cargarPerfil(){

    this.profileService.getUser().pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        this.usuario=data;
        this.imagenUrl=environment.imagenUrl+this.usuario.urlImagen;
      },
      error:(error)=>{
        console.log(error);
      }
    });
  }

  /*Método que se suscribe al observable de sharedService y cuando emita el observable 
  actualizamos el perfil*/
  actualizarPerfil(){
    this.sharedService.cambiarPerfil$.pipe(takeUntil(this.destroy$)).subscribe({
      next:()=>{
        this.cargarPerfil();
      }
    });
  }
  /*Cierre de sesión del usuario */
  cerrarSesion(){
    this.authService.removeToken();

    this.authService.logOut().pipe(takeUntil(this.destroy$)).subscribe({
      next:()=>{
        this.router.navigate(['login']);
      },
      error:(error)=>{
        console.log(error.error.mensaje);
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
