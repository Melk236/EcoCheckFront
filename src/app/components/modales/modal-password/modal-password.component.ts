import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports:[CommonModule,FormsModule],
  selector: 'app-modal-password',
  templateUrl: './modal-password.html'
})
export class ModalPasswordComponent {
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Input() error: string = '';

  password: string = '';
  confirmPassword: string = '';

  onConfirm() {
    if (this.password === this.confirmPassword && this.password.length >= 6) {
      this.confirm.emit(this.password);
    }
  }

  onCancel() {
    this.password = '';
    this.confirmPassword = '';
    this.cancel.emit();
  }
}
