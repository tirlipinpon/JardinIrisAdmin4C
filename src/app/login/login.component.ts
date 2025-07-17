import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  constructor(private router: Router) {}

  onLoginSuccess() {
    console.log('Login success');
    // Appelle cette méthode après une authentification réussie
    this.router.navigate(['/create']);
  }
} 