import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../types/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AlertaComponent } from '../modales/alerta/alerta.component';
import { environment } from '../../environment/environment';
import { ModalConfirmarComponent } from '../modales/modal-confirmar/modal-confirmar.component';
import { ModalPasswordComponent } from '../modales/modal-password/modal-password.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule, AlertaComponent, ModalConfirmarComponent, ModalPasswordComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  //Url Imagen del servidor
  private urlImagen = environment.imagenUrl;
  imagen: File | null = null;
  imagePreview: string = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHLdsiS9dq6Rw-7AGCek6S_kGx5ORZjUUl6gYWpmcoQgQgJxf85gOXxdYeCuslnDUgMP0s4H9PzyX3JxwRctFgWEcqDbHZtG1VHsWvGK7PCZZI2l-Jcacl3vW03P45-mnhV7bTnXy_Y6X3ofgZtIf2QAHgmFTX3hVPrwWyV5IQhTsavrryAYPGkZgPy5etb2whyYj_d5jNEGm36qLqwG84mEjxTWFUFb4Y3HfQbflhBN_hguNpntKjmHZwTwnR-uNomyeASTx3VOmX';
  formulario: FormGroup;
  usuario: User = {
    id: 0,
    userName: '',
    roleName: ''
  }
  modalFotoAbierta: boolean = false;
  modalConfirmacion: boolean = false;
  modalPassword: boolean = false;
  opcion: number = 0;
  mensajeError: string = '';
  mensajeModal: string = '';
  esExito: boolean = false;
  tipo: string = '';
  body:{password:string,newPassword:string}={
    password: '',
    newPassword: ''
  }
  destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private profileService: ProfileService,private route: Router) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z]*$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z ]*$/)]],
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
    const form = new FormData();
    form.append('userName', this.usuario.userName);
    form.append('nombre', this.formulario.get('nombre')?.value);
    form.append('apellido', this.formulario.get('apellido')?.value.trim());
    form.append('email', this.formulario.get('email')?.value.trim());
    form.append('imagen', this.imagen!);


    this.profileService.update(form).pipe(takeUntil(this.destroy$)).
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

          this.formulario.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email
          });

          this.imagePreview = this.urlImagen + data.urlImagen;

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
    this.mensajeError = '';
  }

  /*Abrir modal de confirmación para operaciones */
  mostrarModalConfirmacion(opcion: number) {
    this.opcion = opcion;

    switch (opcion) {
      case 1:
        this.tipo = 'actualizar';
        this.mensajeModal = '¿Está seguro de actualizar su perfil?';
        break;
      case 2:
        this.tipo = 'actualizar';
        this.mensajeModal = '¿Está seguro de actualizar su contraseña?';
        this.cerrarModalPassword();
        break;
      case 3:
        this.tipo = 'borrar'
        this.mensajeModal = '¿Está seguro de eliminar su cuenta de forma permanente?';
    }

    this.modalConfirmacion = true;

  }

  abrirModalPassword() {
    this.modalPassword = true;
  }

  cerrarModalPassword() {
    this.modalPassword = false;
  }

  /*Cambio de contraseña del usuario */
  onPasswordConfirm(body:{password:string,newPassword:string}) {
    this.opcion = 2;
    this.body={
      password:body.password,
      newPassword:body.newPassword
    }
    this.mostrarModalConfirmacion(this.opcion);
  }

  /*Confirmación del modal hijo por lo se procede a realizar la opración segun la opcion */
  confirmar() {
    switch (this.opcion) {
      case 1:
        this.actualizarDatosUser();
        this.cancelar()//Cerramos el modal hijo
        break;
      case 2:
        this.cambiarContrasena();
        break;
      case 3:
        this.eliminarUsuario()//Eliminamos la cuenta del usuario
    }
  }

  /*Cerramos el modal hijo */
  cancelar() {
    this.modalConfirmacion = false;
  }

  /*Eliminamos la cuenta del usuario luego de que el usuario lo confirme*/
  eliminarUsuario() {
    this.profileService.delete().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        sessionStorage.removeItem('jwt')//Eliminamos el token del usuario de sessionStorage
        this.route.navigate(['login'])//Y lo mandamos al componente login
      },
      error: (error) => {
        console.log(error);
        this.mensajeError = 'No se ha podido eliminar la cuenta del usuario';
      }
    })
  }

  /*Luego de que confirme el usuario de que quiere cambiar la contraseña se la cambiamos 
  llamando al changePassword del servicio profile*/
  cambiarContrasena() {
    
    this.profileService.changePassword(this.body).pipe(takeUntil(this.destroy$)).subscribe({
      next:()=>{
        this.mensajeError = 'Contraseña actualizada correctamente';
        this.esExito = true;
        //Vaciamos body
        this.body={
          password:'',
          newPassword:''
        }
      this.modalConfirmacion=false;
      },
      error:(error)=>{
        console.log(error);
        this.mensajeError='No se ha podido actualizar la contraseña';
        this.esExito=false;
        //Vaciamos body
        this.body={
          password:'',
          newPassword:''
        }
        this.modalConfirmacion=false;
  
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
