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
    userName: '',
    roleName: ''
  }
  imagenUrl='https://lh3.googleusercontent.com/aida-public/AB6AXuBHLdsiS9dq6Rw-7AGCek6S_kGx5ORZjUUl6gYWpmcoQgQgJxf85gOXxdYeCuslnDUgMP0s4H9PzyX3JxwRctFgWEcqDbHZtG1VHsWvGK7PCZZI2l-Jcacl3vW03P45-mnhV7bTnXy_Y6X3ofgZtIf2QAHgmFTX3hVPrwWyV5IQhTsavrryAYPGkZgPy5etb2whyYj_d5jNEGm36qLqwG84mEjxTWFUFb4Y3HfQbflhBN_hguNpntKjmHZwTwnR-uNomyeASTx3VOmX';
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
        this.imagenUrl=environment.imagenUrl+this.usuario.urlImagen;
      },
      error:(error)=>{
        console.log(error);
      }
    })
  }
}
