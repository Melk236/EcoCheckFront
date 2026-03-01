import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {

  const profileService = inject(ProfileService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isTokenValid()) {
    return router.createUrlTree(['/login']);
  }

  return profileService.getUser().pipe(
    map((usuario) => {
      if (usuario.roleName === 'Admin') {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};
