import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, TranslateModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = '';
  error = '';
  success = '';
  loading = false;

  private auth = inject(AuthService);
  private router = inject(Router);

  submit() {
    if (!this.email) {
      this.error = 'Please enter your email';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    this.auth.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.success = response.message || 'Reset link sent!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to send reset link';
        this.loading = false;
      }
    });
  }
}