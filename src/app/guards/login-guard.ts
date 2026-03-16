import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../environment/environment';

export const loginGuard: CanActivateFn = async (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el token es válido, permite acceso inmediatamente
  if (authService.isTokenValid()) {
    return true;
  }

  // Si hay token pero está expirado, intenta refresh con fetch (sin pasar por interceptor)
  if (authService.getToken()) {
    try {
      const response = await fetch(`${environment.apiUrl}Auth/Refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        authService.setToken(data.token);
        return true;
      } else {
        // Refresh falló, redirige al login
        authService.removeToken();
        return router.createUrlTree(['/login']);
      }
    } catch (error) {
      authService.removeToken();
      return router.createUrlTree(['/login']);
    }
  }
  
  // No hay token
  return router.createUrlTree(['/login']);
};
