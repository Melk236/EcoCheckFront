import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url=environment.apiUrl;

  constructor(private http:HttpClient){}

  login(){

  }

  register(){}
}
