import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
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
    MatSnackBarModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  isValidatingToken = true;
  tokenValid = false;
  
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  
  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const type = params['type'];
      
      if (token && type === 'recovery') {
        this.validateToken(token);
      } else {
        this.isValidatingToken = false;
        this.tokenValid = false;
        this.snackBar.open('Lien de réinitialisation invalide', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

  private async validateToken(token: string): Promise<void> {
    try {
      // Supabase vérifie automatiquement le token depuis l'URL
      // On récupère la session pour valider que le token est bon
      const { data: { session }, error } = await this.auth.getSession();
      
      if (error || !session) {
        throw new Error('Token invalide ou expiré');
      }
      
      this.tokenValid = true;
      this.isValidatingToken = false;
    } catch (error) {
      this.isValidatingToken = false;
      this.tokenValid = false;
      this.snackBar.open('Le lien de réinitialisation a expiré ou est invalide', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getErrorMessage(field: string): string {
    const control = this.resetPasswordForm.get(field);
    if (control?.hasError('required')) {
      return `${field === 'password' ? 'Mot de passe' : 'Confirmation'} requis`;
    }
    if (control?.hasError('minlength')) {
      return 'Mot de passe trop court (minimum 6 caractères)';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid || !this.tokenValid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { password } = this.resetPasswordForm.value;
    
    try {
      const { error } = await this.auth.updatePassword(password);
      
      if (error) {
        this.snackBar.open(`Erreur: ${error.message}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }
      
      this.snackBar.open(
        'Mot de passe mis à jour avec succès ! Redirection vers la page de connexion...',
        'Fermer',
        {
          duration: 3000,
          panelClass: ['success-snackbar']
        }
      );
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error) {
      this.snackBar.open('Erreur lors de la mise à jour du mot de passe', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }
}

