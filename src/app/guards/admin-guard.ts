import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { User } from '../types/user';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {


  /*Injectamos el servicio profile para obtener el usuario
  mediante el metodo inject */
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.getUser().pipe(map((usuario) => {
    if (usuario.roleName === 'Admin'){
      console.log('Hola mundo')
      return true;
    } 

 
    router.navigate(['login']); // Redirige a login
    return false; // Acceso denegado
  
    
  })

  );



};
