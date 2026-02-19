// token.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Interceptor que agrega el token JWT almacenado en sessionStorage bajo la clave 'jwt'
 * al encabezado Authorization de cada petición HTTP saliente.
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshSubject = new BehaviorSubject<string | null>(null);

    constructor(private authService:AuthService,private route:Router){}
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
            
            return next.handle(cloned).pipe(
                catchError(error => {
                    if (error.status === 401 && !urlSinToken) {
                        return this.handle401(req, next);
                    }
                    return throwError(() => error);
                })
            );
        }
        // Si no hay token, continúa con la petición original
        return next.handle(req);
    }
    private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<any> {

        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshSubject.next(null);

            

            return this.authService.refreshToken().pipe(
                switchMap(tokens => {
                    this.isRefreshing = false;
                    sessionStorage.setItem('jwt', tokens.token);
                    
                    this.refreshSubject.next(tokens.token);

                    // Reintenta el request original con el nuevo token
                    return next.handle(req.clone({
                        setHeaders: { Authorization: `Bearer ${tokens.token}` }
                    }));
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    sessionStorage.clear();
                    this.route.navigate(['/login']);
                    return throwError(() => err);
                })
            );
        }
s
        // Si ya hay un refresh en curso, espera a que termine
        return this.refreshSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next.handle(req.clone({
                setHeaders: { Authorization: `Bearer ${token!}` }
            })))
        );
    }
}
