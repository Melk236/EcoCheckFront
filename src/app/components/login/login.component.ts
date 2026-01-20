import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl,  FormGroup,  ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthUser } from '../../types/auth-user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnDestroy {

  //Variable para manejar el formulario
  formulario:FormGroup;

  //Observable para la desuscripción de los observables
  destroy$=new Subject<void>();

  /*Inicialización del formcontrol */
  constructor(private fb:FormBuilder,private authService:AuthService){

    this.formulario=this.fb.group({
      user:new FormControl('',[Validators.required,Validators.minLength(6),Validators.maxLength(20),Validators.pattern(/^[a-zA-Z0-9_]*$/)]),
      password:new FormControl('',new FormControl('',[Validators.required,Validators.minLength(6),Validators.maxLength(20),Validators.pattern(/^[a-zA-Z0-9_]*$/)]))
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
        console.log(data);
      },
      error:(error)=>{
        console.log(error);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
