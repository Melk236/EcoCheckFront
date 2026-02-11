// token.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor que agrega el token JWT almacenado en sessionStorage bajo la clave 'jwt'
 * al encabezado Authorization de cada petición HTTP saliente.
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const urlExcludes = [
            '/api/v2/product/',
            
        ];
        // Obtiene el token del sessionStorage
        const token = sessionStorage.getItem('jwt');
        let urlSinToken: boolean = false;

        for (var url in urlExcludes) {

            if (req.url.includes(url)) {
                urlSinToken = true;
                break;
            }

        }
        
        if (token && !urlSinToken) {

            // Clona la petición añadiendo el encabezado Authorization
            const cloned = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
            });
            return next.handle(cloned);
        }
        // Si no hay token, continúa con la petición original
        return next.handle(req);
    }
}
