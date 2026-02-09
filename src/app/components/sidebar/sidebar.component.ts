import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../types/user';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  dropdownOpen = false;
  usuario:User={
    id: 0,
    userName: ''
  }
  imagenUrl=environment.imagenUrl;
  constructor(private router: Router,private profileService:ProfileService) { }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  cargarPerfil(){

    this.profileService.getUser().subscribe({
      next:(data)=>{
        this.usuario=data;
        this.imagenUrl=this.imagenUrl+this.usuario.imagen;
      },
      error:(error)=>{
        console.log(error);
      }
    })
  }
}
