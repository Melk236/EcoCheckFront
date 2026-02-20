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
    sessionStorage.setItem('jwt', token);
  }

  removeToken() {
    sessionStorage.removeItem('jwt');
  }

  refreshToken(): Observable<TokenResponse> {
    
    return this.http.post<TokenResponse>(this.url + 'Refresh', {},{
      withCredentials:true
    });
  }
}
