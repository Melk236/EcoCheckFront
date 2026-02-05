import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';
import { User } from '../types/user';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly url = environment.apiUrl + 'User';

  constructor(private http: HttpClient) { }

  get(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  update(id: number, user: User): Observable<User> {
    const body={
      userName:user.userName,
      nombre:user.nombre,
      apellido:user.apellidos,
      email:user.email
    };
    return this.http.put<User>(`${this.url}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
