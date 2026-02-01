import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ErrorState {
  success: boolean;
  error: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorSubject = new Subject<ErrorState>();
  error$ = this.errorSubject.asObservable();

  handleError(message: string): void {
    console.error(message);
    this.errorSubject.next({ success: false, error: message });
  }

  handleSuccess(message: string = ''): void {
    this.errorSubject.next({ success: true, error: message });
  }

  reset(): void {
    this.errorSubject.next({ success: false, error: '' });
  }
}
