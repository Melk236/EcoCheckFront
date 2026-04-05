import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable, shareReplay } from 'rxjs';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private http=inject(HttpClient);
  private readonly url = environment.apiUrl + 'Profile';

  private user$ = this.http.get<User>(this.url).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  getUser(): Observable<User> {

    return this.user$;
  }

  update(user: FormData): Observable<User> {

    return this.http.put<User>(`${this.url}`, user);
  }

  changePassword(body: { password: string, newPassword: string }): Observable<void> {

    return this.http.patch<void>(this.url + '/ChangePassword', body);

  }

  delete(): Observable<void> {
    return this.http.delete<void>(`${this.url}`);
  }
}
