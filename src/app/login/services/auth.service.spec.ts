import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseService } from '../../shared/services/supabase.service';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(() => {
    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [], {
      client: {
        auth: {
          signInWithPassword: jasmine.createSpy('signInWithPassword'),
          signOut: jasmine.createSpy('signOut'),
          getUser: jasmine.createSpy('getUser'),
          signUp: jasmine.createSpy('signUp')
        }
      }
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseSpy },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(AuthService);
    supabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signIn()', () => {
    it('should call supabase signInWithPassword with correct parameters', () => {
      const email = 'test@example.com';
      const password = 'testpassword';
      const expectedResult = { data: { user: { id: '123' } }, error: null };
      
      (supabaseService.client.auth.signInWithPassword as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signIn(email, password);

      expect(supabaseService.client.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle different email formats', () => {
      const emails = [
        'user@example.com',
        'test.user+tag@domain.co.uk',
        'user123@subdomain.example.org'
      ];
      const password = 'testpassword';
      
      (supabaseService.client.auth.signInWithPassword as jasmine.Spy).and.returnValue({ data: null, error: null });

      emails.forEach(email => {
        service.signIn(email, password);
        expect(supabaseService.client.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      });
    });

    it('should handle different password types', () => {
      const email = 'test@example.com';
      const passwords = [
        'simplepassword',
        'ComplexP@ssw0rd123!',
        '123456789',
        'a'.repeat(100)
      ];
      
      (supabaseService.client.auth.signInWithPassword as jasmine.Spy).and.returnValue({ data: null, error: null });

      passwords.forEach(password => {
        service.signIn(email, password);
        expect(supabaseService.client.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      });
    });

    it('should handle empty email and password', () => {
      const email = '';
      const password = '';
      const expectedResult = { data: null, error: { message: 'Invalid credentials' } };
      
      (supabaseService.client.auth.signInWithPassword as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signIn(email, password);

      expect(supabaseService.client.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle special characters in credentials', () => {
      const email = 'test+special@example.com';
      const password = 'p@ssw0rd!@#$%^&*()';
      const expectedResult = { data: null, error: null };
      
      (supabaseService.client.auth.signInWithPassword as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signIn(email, password);

      expect(supabaseService.client.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });
  });

  describe('signOut()', () => {
    it('should call supabase signOut', () => {
      const expectedResult = { error: null };
      
      (supabaseService.client.auth.signOut as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signOut();

      expect(supabaseService.client.auth.signOut).toHaveBeenCalled();
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle signOut errors', () => {
      const expectedResult = { error: { message: 'Sign out failed' } };
      
      (supabaseService.client.auth.signOut as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signOut();

      expect(supabaseService.client.auth.signOut).toHaveBeenCalled();
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle multiple signOut calls', () => {
      const expectedResult = { error: null };
      
      (supabaseService.client.auth.signOut as jasmine.Spy).and.returnValue(expectedResult as any);

      // Appeler signOut plusieurs fois
      service.signOut();
      service.signOut();
      service.signOut();

      expect(supabaseService.client.auth.signOut).toHaveBeenCalledTimes(3);
    });
  });

  describe('getUser()', () => {
    it('should call supabase getUser', () => {
      const expectedResult = { 
        data: { 
          user: { 
            id: '123', 
            email: 'test@example.com',
            created_at: '2023-01-01T00:00:00Z'
          } 
        }, 
        error: null 
      };
      
      (supabaseService.client.auth.getUser as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.getUser();

      expect(supabaseService.client.auth.getUser).toHaveBeenCalled();
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle when user is not authenticated', () => {
      const expectedResult = { 
        data: { user: null }, 
        error: null 
      };
      
      (supabaseService.client.auth.getUser as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.getUser();

      expect(supabaseService.client.auth.getUser).toHaveBeenCalled();
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle getUser errors', () => {
      const expectedResult = { 
        data: { user: null }, 
        error: { message: 'Failed to get user' } 
      };
      
      (supabaseService.client.auth.getUser as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.getUser();

      expect(supabaseService.client.auth.getUser).toHaveBeenCalled();
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle multiple getUser calls', () => {
      const expectedResult = { 
        data: { user: { id: '123', email: 'test@example.com' } }, 
        error: null 
      };
      
      (supabaseService.client.auth.getUser as jasmine.Spy).and.returnValue(expectedResult as any);

      // Appeler getUser plusieurs fois
      service.getUser();
      service.getUser();

      expect(supabaseService.client.auth.getUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('signUp()', () => {
    it('should call supabase signUp with correct parameters', () => {
      const email = 'newuser@example.com';
      const password = 'newpassword';
      const expectedResult = { 
        data: { 
          user: { id: '456', email: email },
          session: null 
        }, 
        error: null 
      };
      
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signUp({ email, password });

      expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle different email formats for signUp', () => {
      const emails = [
        'user@example.com',
        'test.user+tag@domain.co.uk',
        'user123@subdomain.example.org',
        'new-user@test-domain.com'
      ];
      const password = 'newpassword';
      
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue({ data: null, error: null });

      emails.forEach(email => {
        service.signUp({ email, password });
        expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({ email, password });
      });
    });

    it('should handle different password strengths for signUp', () => {
      const email = 'test@example.com';
      const passwords = [
        'weak',
        'StrongP@ssw0rd123!',
        'medium123',
        'a'.repeat(50)
      ];
      
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue({ data: null, error: null });

      passwords.forEach(password => {
        service.signUp({ email, password });
        expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({ email, password });
      });
    });

    it('should handle signUp with empty credentials', () => {
      const email = '';
      const password = '';
      const expectedResult = { 
        data: null, 
        error: { message: 'Invalid email or password' } 
      };
      
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signUp({ email, password });

      expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle signUp errors', () => {
      const email = 'existing@example.com';
      const password = 'password';
      const expectedResult = { 
        data: null, 
        error: { message: 'User already registered' } 
      };
      
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signUp({ email, password });

      expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle special characters in signUp credentials', () => {
      const email = 'test+special@example.com';
      const password = 'p@ssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?';
      const expectedResult = { data: null, error: null };
      
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signUp({ email, password });

      expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });

    it('should handle Unicode characters in credentials', () => {
      const email = 'tëst@éxämplé.com';
      const password = 'pássw0rd_ñ_中文';
      const expectedResult = { data: null, error: null };
      
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue(expectedResult as any);

      const result = service.signUp({ email, password });

      expect(supabaseService.client.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(result as any).toEqual(expectedResult);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete authentication flow', () => {
      const email = 'test@example.com';
      const password = 'testpassword';
      
      // Mock successful signUp
      (supabaseService.client.auth.signUp as jasmine.Spy).and.returnValue({ 
        data: { user: { id: '123', email } }, 
        error: null 
      });
      
      // Mock successful signIn
      (supabaseService.client.auth.signInWithPassword as jasmine.Spy).and.returnValue({ 
        data: { user: { id: '123', email } }, 
        error: null 
      });
      
      // Mock successful getUser
      (supabaseService.client.auth.getUser as jasmine.Spy).and.returnValue({ 
        data: { user: { id: '123', email } }, 
        error: null 
      });
      
      // Mock successful signOut
      (supabaseService.client.auth.signOut as jasmine.Spy).and.returnValue({ 
        error: null 
      });

      // Exécuter le flow complet
      const signUpResult = service.signUp({ email, password });
      const signInResult = service.signIn(email, password);
      const getUserResult = service.getUser();
      const signOutResult = service.signOut();

      expect(signUpResult).toEqual(jasmine.objectContaining({ data: jasmine.objectContaining({ user: jasmine.objectContaining({ email }) }) }));
      expect(signInResult).toEqual(jasmine.objectContaining({ data: jasmine.objectContaining({ user: jasmine.objectContaining({ email }) }) }));
      expect(getUserResult).toEqual(jasmine.objectContaining({ data: jasmine.objectContaining({ user: jasmine.objectContaining({ email }) }) }));
      expect(signOutResult).toEqual(jasmine.objectContaining({ error: null }));
    });

    it('should handle authentication flow with errors', () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      
      // Mock signIn error
      (supabaseService.client.auth.signInWithPassword as jasmine.Spy).and.returnValue({ 
        data: null, 
        error: { message: 'Invalid credentials' } 
      });
      
      // Mock getUser error
      (supabaseService.client.auth.getUser as jasmine.Spy).and.returnValue({ 
        data: { user: null }, 
        error: { message: 'Not authenticated' } 
      });

      const signInResult = service.signIn(email, password);
      const getUserResult = service.getUser();

      expect(signInResult).toEqual(jasmine.objectContaining({ error: jasmine.objectContaining({ message: 'Invalid credentials' }) }));
      expect(getUserResult).toEqual(jasmine.objectContaining({ data: jasmine.objectContaining({ user: null }) }));
    });
  });
});
