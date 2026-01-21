import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthUser } from '../../types/auth-user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent implements OnDestroy {

  //Variable para manejar el formulario del registro
  formulario: FormGroup;

  //Manejo de errores para la alerta
  mensajeError:string='';
  //Variable manejo desuscripción de los observables
  destroy$ = new Subject<void>();


  constructor(private fb: FormBuilder, private authService: AuthService,private route:Router) {
    this.formulario = this.fb.group({
      user: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]*$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]*$/)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]*$/)]),
    })
  }


  /*Método manejo creación del usuario */
  createUser() {
    const body:AuthUser={
      user: this.formulario.get('user')?.value,
      password: this.formulario.get('password')?.value
    }

    this.authService.register(body).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next:(data)=>{
          this.saveToken(data.token);
          this.route.navigate(['home']);
        },
        error:(error)=>{
          this.mensajeError=error.error.mensaje;

        }

      }
    )
  }

  /*Guardamos el token en el sessionStorage*/
  saveToken(token:string){
    sessionStorage.setItem('jwt',token);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
