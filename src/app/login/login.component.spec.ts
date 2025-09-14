import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from './services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule
      ],
      providers: [
        provideZonelessChangeDetection(),
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    spyOn(window, 'alert');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('togglePasswordVisibility()', () => {
    it('should toggle showPassword from false to true', () => {
      component.showPassword = false;
      
      component.togglePasswordVisibility();
      
      expect(component.showPassword).toBe(true);
    });

    it('should toggle showPassword from true to false', () => {
      component.showPassword = true;
      
      component.togglePasswordVisibility();
      
      expect(component.showPassword).toBe(false);
    });

    it('should toggle showPassword multiple times', () => {
      component.showPassword = false;
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(true);
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(false);
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(true);
    });

    it('should be idempotent when called multiple times', () => {
      const initialValue = component.showPassword;
      
      component.togglePasswordVisibility();
      component.togglePasswordVisibility();
      
      expect(component.showPassword).toBe(initialValue);
    });

    it('should work with different initial states', () => {
      const states = [false, true];
      
      states.forEach(initialState => {
        component.showPassword = initialState;
        component.togglePasswordVisibility();
        expect(component.showPassword).toBe(!initialState);
      });
    });
  });

  describe('getErrorMessage()', () => {
    beforeEach(() => {
      // Reset form to pristine state
      component.loginForm.reset();
    });

    it('should return email required error message', () => {
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('email')?.markAsTouched();
      component.loginForm.get('email')?.setErrors({ required: true });

      const result = component.getErrorMessage('email');

      expect(result).toBe('Email requis');
    });

    it('should return password required error message', () => {
      component.loginForm.get('password')?.setValue('');
      component.loginForm.get('password')?.markAsTouched();
      component.loginForm.get('password')?.setErrors({ required: true });

      const result = component.getErrorMessage('password');

      expect(result).toBe('Mot de passe requis');
    });

    it('should return email invalid error message', () => {
      component.loginForm.get('email')?.setValue('invalid-email');
      component.loginForm.get('email')?.markAsTouched();
      component.loginForm.get('email')?.setErrors({ email: true });

      const result = component.getErrorMessage('email');

      expect(result).toBe('Email invalide');
    });

    it('should return password minlength error message', () => {
      component.loginForm.get('password')?.setValue('123');
      component.loginForm.get('password')?.markAsTouched();
      component.loginForm.get('password')?.setErrors({ minlength: { requiredLength: 6, actualLength: 3 } });

      const result = component.getErrorMessage('password');

      expect(result).toBe('Mot de passe trop court (minimum 6 caractères)');
    });

    it('should return empty string when no errors', () => {
      component.loginForm.get('email')?.setValue('valid@email.com');
      component.loginForm.get('email')?.setErrors(null);

      const result = component.getErrorMessage('email');

      expect(result).toBe('');
    });

    it('should return empty string when field does not exist', () => {
      const result = component.getErrorMessage('nonexistent');

      expect(result).toBe('');
    });

    it('should handle different field types', () => {
      const fields = ['email', 'password'];
      
      fields.forEach(field => {
        component.loginForm.get(field)?.setValue('');
        component.loginForm.get(field)?.setErrors({ required: true });
        
        const result = component.getErrorMessage(field);
        const expectedMessage = field === 'email' ? 'Email requis' : 'Mot de passe requis';
        
        expect(result).toBe(expectedMessage);
      });
    });

    it('should handle multiple errors on same field', () => {
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('email')?.setErrors({ required: true, email: true });

      const result = component.getErrorMessage('email');

      // Should return the first error (required)
      expect(result).toBe('Email requis');
    });

    it('should handle case-sensitive field names', () => {
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('email')?.setErrors({ required: true });

      const result = component.getErrorMessage('EMAIL');

      expect(result).toBe('');
    });
  });

  describe('onSubmit()', () => {
    beforeEach(() => {
      component.isLoading = false;
    });

    it('should not submit when form is invalid', async () => {
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('password')?.setValue('');
      component.loginForm.get('email')?.setErrors({ required: true });
      component.loginForm.get('password')?.setErrors({ required: true });

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
      expect(component.loginForm.touched).toBe(true);
    });

    it('should submit when form is valid and authentication succeeds', async () => {
      const mockAuthResponse = { data: { user: { id: '123' } }, error: null };
      mockAuthService.signIn.and.returnValue(Promise.resolve(mockAuthResponse) as any);

      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('password')?.setValue('password123');

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(window.alert).toHaveBeenCalledWith('Connexion réussie !');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/create']);
    });

    it('should handle authentication error', async () => {
      const mockAuthResponse = { 
        data: null, 
        error: { message: 'Invalid credentials' } 
      };
      mockAuthService.signIn.and.returnValue(Promise.resolve(mockAuthResponse) as any);

      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('password')?.setValue('wrongpassword');

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      expect(window.alert).toHaveBeenCalledWith('Erreur de connexion: Invalid credentials');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockAuthService.signIn.and.returnValue(Promise.reject(new Error('Network error')));

      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('password')?.setValue('password123');

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(window.alert).toHaveBeenCalledWith('Erreur inattendue lors de la connexion');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should set isLoading to true during submission', async () => {
      const mockAuthResponse = { data: { user: { id: '123' } }, error: null };
      mockAuthService.signIn.and.returnValue(Promise.resolve(mockAuthResponse) as any);

      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('password')?.setValue('password123');

      // Start the async operation
      const submitPromise = component.onSubmit();
      
      // Check that isLoading is true during the operation
      expect(component.isLoading).toBe(true);

      // Wait for completion
      await submitPromise;

      // Check that isLoading is false after completion
      expect(component.isLoading).toBe(false);
    });

    it('should set isLoading to false even when error occurs', async () => {
      mockAuthService.signIn.and.returnValue(Promise.reject(new Error('Network error')));

      component.loginForm.get('email')?.setValue('test@example.com');
      component.loginForm.get('password')?.setValue('password123');

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
    });

    it('should extract email and password from form values', async () => {
      const mockAuthResponse = { data: { user: { id: '123' } }, error: null };
      mockAuthService.signIn.and.returnValue(Promise.resolve(mockAuthResponse) as any);

      const testEmail = 'user@test.com';
      const testPassword = 'secretpass';
      
      component.loginForm.get('email')?.setValue(testEmail);
      component.loginForm.get('password')?.setValue(testPassword);

      await component.onSubmit();

      expect(mockAuthService.signIn).toHaveBeenCalledWith(testEmail, testPassword);
    });

    it('should handle different authentication response formats', async () => {
      const responseFormats = [
        { data: { user: { id: '1' } }, error: null },
        { data: { user: { id: '2' } }, error: null },
        { data: null, error: { message: 'Error 1' } },
        { data: null, error: { message: 'Error 2' } }
      ];

      for (const response of responseFormats) {
        // Reset spies before each iteration
        mockAuthService.signIn.calls.reset();
        mockRouter.navigate.calls.reset();
        (window.alert as jasmine.Spy).calls.reset();
        
        mockAuthService.signIn.and.returnValue(Promise.resolve(response) as any);
        
        component.loginForm.get('email')?.setValue('test@example.com');
        component.loginForm.get('password')?.setValue('password123');
        component.isLoading = false;

        await component.onSubmit();

        if (response.error) {
          expect(window.alert).toHaveBeenCalledWith(`Erreur de connexion: ${response.error.message}`);
          expect(mockRouter.navigate).not.toHaveBeenCalled();
        } else {
          expect(window.alert).toHaveBeenCalledWith('Connexion réussie !');
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/create']);
        }

        expect(component.isLoading).toBe(false);
      }
    });

    it('should handle form with partial values', async () => {
      component.loginForm.get('email')?.setValue('test@example.com');
      // password is empty
      component.loginForm.get('password')?.setValue('');
      component.loginForm.get('password')?.setErrors({ required: true });

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
      expect(mockAuthService.signIn).not.toHaveBeenCalled();
      expect(component.loginForm.touched).toBe(true);
    });
  });

  describe('Component initialization', () => {
    it('should initialize with default form values', () => {
      expect(component.loginForm.get('email')?.value).toBe('tony-ster@hotmail.com');
      expect(component.loginForm.get('password')?.value).toBe('motdepasse123');
    });

    it('should initialize with correct validators', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      expect(emailControl?.hasError('required')).toBe(false);
      expect(emailControl?.hasError('email')).toBe(false);
      expect(passwordControl?.hasError('required')).toBe(false);
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should initialize with default state values', () => {
      expect(component.showPassword).toBe(false);
      expect(component.isLoading).toBe(false);
    });
  });
});