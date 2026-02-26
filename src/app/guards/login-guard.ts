import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  
  const authService=inject(AuthService);
  const router=inject(Router);

  if(authService.isTokenValid()) return true; //Si el token es válido entramos en las rutas

  router.navigate(['login']);
  return false; //Si el token es inválido nos entramos en el componente


};
