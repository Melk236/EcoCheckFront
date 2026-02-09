import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthUser } from '../../types/auth-user';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AlertaComponent } from "../modales/alerta/alerta.component";
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, AlertaComponent, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, OnDestroy {

  //Variable para manejar el formulario
  formulario: FormGroup;

  //Variable para el mensaje del error
  mensaje: string = '';

  //Variable manejo del spinner
  cargando: boolean = false;
  //Observable para la desuscripción de los observables
  destroy$ = new Subject<void>();

  /*Inicialización del formGroup */
  constructor(private fb: FormBuilder, private authService: AuthService, private route: Router, private profileService: ProfileService) {

    this.formulario = this.fb.group({
      user: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }
  ngOnInit(): void {
    this.getUser();
  }


  /*Método para enviar los datos del usuario al servidor */
  onSubmit() {
    //Activamos el spinner
    this.cargando = true;

    const body: AuthUser = {
      user: this.formulario.get('user')?.value,
      password: this.formulario.get('password')?.value
    };

    this.authService.login(body).pipe(takeUntil(this.destroy$)).
      subscribe({
        next: (data) => {
          this.cargando = false;//esactivamos el spinner
          this.saveToken(data.token)//Guardamos el token en el 
          this.route.navigate(['home']);//Navegamos al componente Home
        },
        error: (error) => {
          this.cargando = false;
          this.mensaje = error.error.mensaje;
          this.closeAlert();
        }
      });
  }

  /*Guardamos el token en el sessionSotrage */
  saveToken(token: string) {

    this.authService.setToken(token);

  }

  /*Añadimos un setTimeout para que la alerta desaparezca 
  en un tiempo determinado*/
  closeAlert() {
    setTimeout(() => {
      this.mensaje = '';
    }, 2500);
  }

  getUser() {
    this.profileService.getUser().pipe(takeUntil(this.destroy$)).
      subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
