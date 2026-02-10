import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-password.html'
})
export class ModalPasswordComponent {
  @Output() confirm = new EventEmitter<{password:string,newPassword:string}>();
  @Output() cancel = new EventEmitter<void>();

  formulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]*$/)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    });
  }

  onConfirm() {
    if (this.formulario.valid && this.formulario.get('password')?.value === this.formulario.get('confirmPassword')?.value) {
      const body={
        password:this.formulario.get('currentPassword')?.value,
        newPassword:this.formulario.get('password')?.value
      }

      this.confirm.emit(body);

    }
  }

  onCancel() {
    this.formulario.reset();
    this.cancel.emit();
  }
}
