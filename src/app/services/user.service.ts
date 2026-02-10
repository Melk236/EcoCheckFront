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

  update(id: number, user: FormData): Observable<User> {
    
    return this.http.put<User>(`${this.url}/${id}`, user);
  }

  changePassword(id:number,body:{password:string,newPassword:string}):Observable<void>{

    return this.http.patch<void>(this.url+'/'+id+'/ChangePassword',body);

  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  
}
