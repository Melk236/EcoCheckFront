import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl,  FormGroup,  ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthUser } from '../../types/auth-user';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AlertaComponent } from "../modales/alerta/alerta.component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, AlertaComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnDestroy {

  //Variable para manejar el formulario
  formulario:FormGroup;

  //Variable para el mensaje del error
  mensaje:string='';

  //Observable para la desuscripción de los observables
  destroy$=new Subject<void>();

  /*Inicialización del formcontrol */
  constructor(private fb:FormBuilder,private authService:AuthService,private route:Router){

    this.formulario=this.fb.group({
      user:new FormControl('',[Validators.required,Validators.minLength(6),Validators.maxLength(20),Validators.pattern(/^[a-zA-Z0-9_]*$/)]),
      password:new FormControl('',[Validators.required,Validators.minLength(6),Validators.maxLength(20),Validators.pattern(/^[a-zA-Z0-9_]*$/)])
    });
  }
  

  /*Método para enviar los datos del usuario al servidor */
  onSubmit(){
    const body:AuthUser={
      user: this.formulario.get('user')?.value,
      password: this.formulario.get('password')?.value
    };

    this.authService.login(body).pipe(takeUntil(this.destroy$)).
    subscribe({
      next:(data)=>{
        this.saveToken(data.token)//Guardamos el token en el 
        this.route.navigate(['home']);//Navegamos al componente Home
      },
      error:(error)=>{
        this.mensaje=error.error.mensaje;
        this.closeAlert();
      }
    });
  }

  /*Guardamos el token en el sessionSotrage */
  saveToken(token:string){

    sessionStorage.setItem('jwt',token);

  }

  /*Añadimos un setTimeout para que la alert desaparezca 
  en un tiempo determinado*/
  closeAlert(){
    setTimeout(() => {
      this.mensaje='';  
    }, 2500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
