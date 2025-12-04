import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { environment } from '../../../../../../environment';

export interface DeepseekMessage {
  role: string;
  content: string;
}

export interface DeepseekChoiceMessage {
  role?: string;
  content?: string;
  [key: string]: unknown;
}

export interface DeepseekChoice {
  index?: number;
  message?: DeepseekChoiceMessage;
  finish_reason?: string;
  [key: string]: unknown;
}

export interface DeepseekCompletionResponse {
  choices?: DeepseekChoice[];
  [key: string]: unknown;
}

export interface DeepseekCompletionParams {
  messages: DeepseekMessage[];
  temperature?: number;
  maxTokens?: number;
  requestId?: string;
}

@Injectable({ providedIn: 'root' })
export class DeepseekProxyService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly apiUrl = `${environment.supabaseUrl}/functions/v1/deepseek-proxy`;

  async createCompletion(params: DeepseekCompletionParams): Promise<DeepseekCompletionResponse> {
    const headers = await this.buildHeaders(params.requestId);
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 200,
      }),
    });

    const responseText = await response.text();
    const body = this.parseJsonSafely(responseText);

    if (!response.ok) {
      throw new Error(
        `DeepSeek proxy error ${response.status}: ${JSON.stringify(body)}`,
      );
    }

    if (typeof body !== 'object' || body === null) {
      throw new Error('DeepSeek proxy returned an invalid payload.');
    }

    return body as DeepseekCompletionResponse;
  }

  private async buildHeaders(requestId?: string): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      apikey: environment.supabaseAnonKey,
    });

    let accessToken: string | null = null;

    try {
      const { data, error } = await this.supabaseService.client.auth.getSession();

      if (error) {
        console.warn('[DeepseekProxyService] Impossible de récupérer la session Supabase:', error);
      }

      accessToken = data?.session?.access_token ?? null;
    } catch (error) {
      console.warn('[DeepseekProxyService] Erreur inattendue lors de la récupération de session:', error);
    }

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      headers.set('Authorization', `Bearer ${environment.supabaseAnonKey}`);
    }

    if (requestId) {
      headers.set('X-Request-ID', requestId);
    }

    return headers;
  }

  private parseJsonSafely(payload: string): unknown {
    if (!payload) {
      return null;
    }

    try {
      return JSON.parse(payload) as unknown;
    } catch {
      return { data: payload };
    }
  }
}

