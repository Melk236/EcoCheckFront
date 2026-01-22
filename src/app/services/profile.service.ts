import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly url = environment.apiUrl + 'Profile';

  constructor(private http: HttpClient) { }

  getUser(): Observable<User> {

    let token: string | null = this.getToken();
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<User>(this.url, { headers });
  }

  getToken(): string | null {
    return sessionStorage.getItem('jwt');
  }
}
