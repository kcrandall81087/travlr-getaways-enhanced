import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  public formError = '';
  public isSubmitting = false;

  public credentials = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  public onRegisterSubmit(): void {
    this.formError = '';

    if (
      !this.credentials.name ||
      !this.credentials.email ||
      !this.credentials.password ||
      !this.credentials.confirmPassword
    ) {
      this.formError = 'All fields are required.';
      return;
    }

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.formError = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    const user = {
      name: this.credentials.name,
      email: this.credentials.email
    } as User;

    this.authenticationService
      .register(user, this.credentials.password)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.formError =
            error?.error?.message ??
            'Unable to create the account.';
        }
      });
  }
}