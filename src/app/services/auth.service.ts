import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthUser } from '../types/auth-user';
import { Observable } from 'rxjs';
import { TokenResponse } from '../types/token-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url = environment.apiUrl + 'Auth/';

  constructor(private http: HttpClient) { }

  login(usuario: AuthUser): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.url + 'login', usuario, {
      withCredentials: true
    });
  }

  register(usuario: AuthUser): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.url + 'Register', usuario, {
      withCredentials: true
    });
  }

  setToken(token: string) {
    localStorage.setItem('jwt', token);
  }

  removeToken() {
    localStorage.removeItem('jwt');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return false;
      }

      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {//Si no hay header,payload y la key.
        return null;
      }

      const payload = parts[1];
      /*Hacemos l replace para pasar d base64url a base64 y con el método atob lo pasamos a texto normal */
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  refreshToken(): Observable<TokenResponse> {
    
    return this.http.post<TokenResponse>(this.url + 'Refresh', {},{
      withCredentials:true
    });
  }

  logOut():Observable<void>{

  return this.http.post<void>(this.url+'LogOut',{},{
     withCredentials:true
  });

  }
}
