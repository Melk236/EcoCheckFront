import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../types/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AlertaComponent } from '../modales/alerta/alerta.component';



@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule, AlertaComponent],
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
  modalFotoAbierta: boolean = false;
  mensajeError: string = '';
  esExito: boolean = false;

  destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private profileService: ProfileService, private UserService: UserService) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z]*$/)]],
      apellido: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z ]*$/)]],
      email: ['', [Validators.email]]
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
    //FormData para actualizar los datos del usuario con la imagen
    const form=new FormData();
    form.append('userName',this.usuario.userName);
    form.append('nombre',this.formulario.get('nombre')?.value);
    form.append('apellido',this.formulario.get('apellido')?.value.trim());
    form.append('email',this.formulario.get('email')?.value.trim());
    form.append('imagen',this.imagen!);


    this.UserService.update(this.usuario.id, form).pipe(takeUntil(this.destroy$)).
      subscribe({
        next: (data) => {
          this.usuario = data;
          this.mensajeError = 'Perfil actualizado correctamente';
          this.esExito = true;
        },
        error: (error) => {
          console.log(error);
          this.mensajeError = 'Error al actualizar el perfil';
          this.esExito = false;
        }
      });
  }

  /*Nos treamos el perfil del usuario*/
  cargarPerfil() {

    this.profileService.getUser().pipe(takeUntil(this.destroy$)).
      subscribe({
        next: (data) => {
          this.usuario = data;
          console.log(this.usuario);
          this.formulario.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email
          });
        },
        error: (error) => {
          console.log('Error al obtener al usuario ' + error);
        }
      });
  }

  abrirModalFoto() {
    this.modalFotoAbierta = true;
  }

  cerrarModalFoto() {
    this.modalFotoAbierta = false;
  }

  cerrarAlerta() {
    setTimeout(() => {
      this.mensajeError = '';
    }, 3000);
  }

  /*Al destruirse el componente nos desuscribimos de los observables para que 
  no haya una fugas de memoria */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
