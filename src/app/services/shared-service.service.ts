import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  
  cambiarPerfil$=new Subject<void>();
  constructor(){}

  emitirObservable():void{
    return this.cambiarPerfil$.next();
  }

}
