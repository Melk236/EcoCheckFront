import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AuthUser } from '../types/auth-user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url=environment.apiUrl+'Auth/';

  constructor(private http:HttpClient){}

  login(usuario:AuthUser):Observable<{token:string}>{
    return this.http.post<{token:string}>(this.url+'login',usuario);
  }

  register(usuario:AuthUser):Observable<{token:string}>{
    return this.http.post<{token:string}>(this.url+'Register',usuario);
  }
}
