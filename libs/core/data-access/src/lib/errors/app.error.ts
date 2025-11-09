/**
 * Classe de base pour toutes les erreurs applicatives
 * Permet un traitement uniforme des erreurs dans toute l'application
 */
export class AppError extends Error {
  readonly timestamp: Date;
  readonly context?: string;

  constructor(message: string, context?: string) {
    super(message);
    this.name = 'AppError';
    this.timestamp = new Date();
    this.context = context;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }
}

/**
 * Erreur liée aux providers IA (OpenAI, DeepSeek, Gemini)
 */
export class AIProviderError extends AppError {
  readonly provider: string;
  readonly originalError?: any;

  constructor(message: string, context: string, originalError?: any) {
    super(message, context);
    this.name = 'AIProviderError';
    this.provider = context.includes('OpenAI') ? 'OpenAI' : 
                    context.includes('DeepSeek') ? 'DeepSeek' : 
                    context.includes('Gemini') ? 'Gemini' : 'Unknown';
    this.originalError = originalError;
  }
}

/**
 * Erreur liée à la base de données (Supabase)
 */
export class DatabaseError extends AppError {
  readonly code: string;

  constructor(message: string, code: string, context?: string) {
    super(message, context);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

/**
 * Erreur liée aux APIs externes (YouTube, Pexels, iNaturalist)
 */
export class ExternalAPIError extends AppError {
  readonly apiName: string;
  readonly statusCode?: number;

  constructor(message: string, apiName: string, statusCode?: number, context?: string) {
    super(message, context);
    this.name = 'ExternalAPIError';
    this.apiName = apiName;
    this.statusCode = statusCode;
  }
}

/**
 * Erreur de validation des données
 */
export class ValidationError extends AppError {
  readonly errors: string[];

  constructor(message: string, errors: string[], context?: string) {
    super(message, context);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Erreur réseau générique
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: string) {
    super(message, context);
    this.name = 'NetworkError';
  }
}

/**
 * Erreur générique pour les cas non classifiés
 */
export class GenericError extends AppError {
  constructor(message: string, context?: string) {
    super(message, context);
    this.name = 'GenericError';
  }
}

