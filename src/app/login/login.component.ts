import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  showResetPassword = false;
  resetPasswordEmail = '';
  isResettingPassword = false;
  
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['tony-ster@hotmail.com', [Validators.required, Validators.email]],
      password: ['motdepasse123', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleResetPassword(): void {
    this.showResetPassword = !this.showResetPassword;
    if (this.showResetPassword) {
      this.resetPasswordEmail = this.loginForm.get('email')?.value || '';
    }
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

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    
    try {
      const { data, error } = await this.auth.signIn(email, password);
      
      if (error) {
        this.snackBar.open(`Erreur de connexion: ${error.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      // Connexion réussie - redirection directe vers /create
      this.router.navigate(['/create']);
    } catch (error) {
      this.snackBar.open('Erreur inattendue lors de la connexion', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async onResetPassword(): Promise<void> {
    if (!this.resetPasswordEmail || !this.isValidEmail(this.resetPasswordEmail)) {
      this.snackBar.open('Veuillez entrer une adresse email valide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isResettingPassword = true;
    
    try {
      const { error } = await this.auth.resetPassword(this.resetPasswordEmail);
      
      if (error) {
        this.snackBar.open(`Erreur: ${error.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.snackBar.open(
        'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.',
        'Fermer',
        {
          duration: 5000,
          panelClass: ['success-snackbar']
        }
      );
      
      this.showResetPassword = false;
      this.resetPasswordEmail = '';
    } catch (error) {
      this.snackBar.open('Erreur lors de l\'envoi de l\'email de réinitialisation', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isResettingPassword = false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 