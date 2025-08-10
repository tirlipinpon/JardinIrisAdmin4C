import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = 'tony-ster@hotmail.com';
  password = 'motdepasse123';
  error: string | null = null;

  constructor(private router: Router, private auth: AuthService) {}

  async onLoginSuccess() {
    this.error = null;
    const { data, error } = await this.auth.signIn(this.email, this.password);
    if (error) {
      this.error = error.message;
      return;
    }
    this.router.navigate(['/dashboard']);
  }
} 