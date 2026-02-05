import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../types/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';



@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit, OnDestroy {

  imagen: File | null = null;
  imagePreview: string = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHLdsiS9dq6Rw-7AGCek6S_kGx5ORZjUUl6gYWpmcoQgQgJxf85gOXxdYeCuslnDUgMP0s4H9PzyX3JxwRctFgWEcqDbHZtG1VHsWvGK7PCZZI2l-Jcacl3vW03P45-mnhV7bTnXy_Y6X3ofgZtIf2QAHgmFTX3hVPrwWyV5IQhTsavrryAYPGkZgPy5etb2whyYj_d5jNEGm36qLqwG84mEjxTWFUFb4Y3HfQbflhBN_hguNpntKjmHZwTwnR-uNomyeASTx3VOmX';
  formulario: FormGroup;
  usuario: User = {
    id: 0,
    userName: ''
  }

  destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private profileService: ProfileService,private UserService:UserService) {
    this.formulario = this.fb.group({
      nombre: [this.usuario.userName, [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z]*$/)]],
      apellidos: [this.usuario.apellidos, [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z ]*$/)]],
      email: [this.usuario.email, [Validators.email]]
    });

  }

  ngOnInit(): void {

    this.cargarPerfil();

  }


  /*Abrimos el archivo dándole click al input type file*/
  abrirArchivos() {
    document.getElementById('file')?.click();
  }

  /*Obtenemos el objeto FileList del input comprobamos que no está vacío y 
  cogemos el primer elemento que es el nos interesa
  */
  subirImagen(event: Event) {
    const inputFile = event.target as HTMLInputElement;

    if (!this.comprobarArchivo(inputFile.files)) return;

  }

  /*Validaciones del archivo(vacio,type image...ect) */
  comprobarArchivo(archivo: FileList | null): boolean {
    const archivosPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (archivo == null || archivo.length == 0) return false;

    if (!archivosPermitidos.includes(archivo.item(0)!.type)) return false;

    this.imagen = archivo.item(0);
    this.imagePreview = URL.createObjectURL(this.imagen!);

    return true;

  }

  //Envíos datos formualario del usuario
  actualizarDatosUser() {
    const body:User = {
      id: 0,
      userName: '',
      nombre: this.formulario.get('nombre')?.value,
      apellidos: this.formulario.get('apellidos')?.value.trim(),
      email: this.formulario.get('email')?.value
    }

    this.UserService.update(this.usuario.id,body).pipe(takeUntil(this.destroy$)).
    subscribe({
      next:(data)=>{
        this.usuario=data;
      },
      error:(error)=>{
        console.log(error);
      }
      
    })
  }

  /*Nos treamos el perfil del usuario*/
  cargarPerfil() {

    this.profileService.getUser().pipe(takeUntil(this.destroy$)).
      subscribe({
        next: (data) => {
          this.usuario = data;
        },
        error: (error) => {
          console.log('Error al obtener al usuario ' + error);
        }
      });
  }

  /*Al destruirse el componente nos desuscribimos de los observables para que 
  no haya una fugas de memoria */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
