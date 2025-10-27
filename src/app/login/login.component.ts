import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  template: `
    <div style="padding: 20px; max-width: 400px; margin: 0 auto;">
      <h1 style="color: #2e7d32; text-align: center;">🌱 Jardin Iris Admin</h1>
      <p style="text-align: center; color: #666;">Votre espace de création d'articles</p>
      
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" style="margin-top: 30px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email :</label>
          <input 
            type="email" 
            formControlName="email" 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
            placeholder="votre@email.com">
          <div style="color: red; font-size: 12px; margin-top: 5px;" 
               *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            {{ getErrorMessage('email') }}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Mot de passe :</label>
          <input 
            type="password" 
            formControlName="password" 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
            placeholder="Votre mot de passe">
          <div style="color: red; font-size: 12px; margin-top: 5px;" 
               *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            {{ getErrorMessage('password') }}
          </div>
        </div>

        <button 
          type="submit" 
          [disabled]="isLoading"
          style="width: 100%; padding: 12px; background: #2e7d32; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">
          <span *ngIf="!isLoading">🚀 Se connecter</span>
          <span *ngIf="isLoading">⏳ Connexion...</span>
        </button>
      </form>
      
      <p style="text-align: center; margin-top: 20px; color: #666;">
        🌿 Cultivez vos idées, récoltez du contenu de qualité
      </p>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  
  constructor(
    private router: Router, 
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['tony-ster@hotmail.com', [Validators.required, Validators.email]],
      password: ['motdepasse123', [Validators.required, Validators.minLength(6)]]
    });
  }
 

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return `${field === 'email' ? 'Email' : 'Mot de passe'} requis`;
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minlength')) {
      return 'Mot de passe trop court (minimum 6 caractères)';
    }
    return '';
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    
    try {
      const { data, error } = await this.auth.signIn(email, password);
      
      if (error) {
        alert(`Erreur de connexion: ${error.message}`);
        return;
      }
      
      // Connexion réussie - redirection directe vers /create
      this.router.navigate(['/create']);
    } catch (error) {
      alert('Erreur inattendue lors de la connexion');
    } finally {
      this.isLoading = false;
    }
  }
} 