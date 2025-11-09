import { Injectable } from '@angular/core';
import OpenAI from "openai";
import { environment } from '@env';


@Injectable({
  providedIn: 'root'
})
export class OpenaiApiService {
  openai = new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: environment.openAiApiKey
  });
  deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    dangerouslyAllowBrowser: true,
    apiKey: environment.deepseekApi
  });
  gemini = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    dangerouslyAllowBrowser: true,
    apiKey: environment.geminiApi
  });
  async fetchData(prompt: any, deepseek?: boolean, debugName?: string) {
    const client = deepseek ? this.deepseek : this.openai;
    const completion = await client.chat.completions.create(
      {
        messages: [
          prompt.systemRole,
          prompt.userRole
        ],
        model: deepseek ? "deepseek-chat" : "gpt-5-mini-2025-08-07",
      },
      {
        headers: { "X-Request-ID": debugName }
      }
    );

    // console.log('completion.choices[0]= '+ JSON.stringify(completion.choices[0]));
    return completion.choices[0].message.content
  }

  async fetchDataImage(prompt: any, regularUrls: string[], debugName?: string) {
    try {
      // Validation préalable des URLs
      const validUrls = await this.validateImageUrls(regularUrls);
      
      if (validUrls.length === 0) {
        console.warn('⚠️ [OPENAI_API] Aucune URL d\'image valide trouvée');
        return JSON.stringify({ imageUrl: '' });
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          prompt.systemRole,
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt.userRole.content,
              },
              ...validUrls.map((url) => ({
                type: "image_url",
                image_url: { url },
              })),
            ],
          }],
      });
      // console.log('completion.choices[0]= '+ JSON.stringify(completion.choices[0]));
      return completion.choices[0].message.content
    } catch (error: any) {
      console.error('❌ [OPENAI_API] Erreur fetchDataImage:', error);
      
      // Gestion spécifique des erreurs d'images
      if (error?.error?.code === 'invalid_image_url') {
        console.warn('⚠️ [OPENAI_API] URL d\'image invalide, retry avec URLs alternatives');
        return this.retryWithFallbackUrls(prompt, regularUrls, debugName);
      }
      
      throw error;
    }
  }


  async imageGeneratorUrl(promptText: string, debugName?: string) {
    const image = await this.openai.images.generate({
      model: "gpt-image-1",
      prompt: promptText,
      n: 1,
      size: "1024x1024"
    }, {
      headers: debugName ? { "X-Request-ID": debugName } : {}
    });
   
    if (!image.data || image.data.length === 0) {
      throw new Error("Aucune image n'a été générée");
    }
   
    return image.data[0].b64_json;
   }

  /**
   * Valide les URLs d'images en vérifiant leur accessibilité
   * @param urls Liste des URLs à valider
   * @returns URLs valides et accessibles
   */
  private async validateImageUrls(urls: string[]): Promise<string[]> {
    const validUrls: string[] = [];
    
    for (const url of urls) {
      try {
        // Test rapide de l'URL avec un timeout court
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 secondes max
        });
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          validUrls.push(url);
          console.log('✅ [OPENAI_API] URL valide:', url);
        } else {
          console.warn('⚠️ [OPENAI_API] URL invalide ou non-image:', url);
        }
      } catch (error) {
        console.warn('⚠️ [OPENAI_API] URL inaccessible:', url, error);
      }
    }
    
    return validUrls;
  }

  /**
   * Retry avec URLs alternatives en cas d'échec
   * @param prompt Prompt original
   * @param originalUrls URLs originales
   * @param debugName Nom pour debug
   * @returns Résultat de l'analyse ou fallback
   */
  private async retryWithFallbackUrls(prompt: any, originalUrls: string[], debugName?: string): Promise<string> {
    try {
      // Générer des URLs alternatives avec des paramètres différents
      const fallbackUrls = this.generateFallbackUrls(originalUrls);
      
      console.log('🔄 [OPENAI_API] Retry avec URLs alternatives:', fallbackUrls);
      
      // Valider les URLs alternatives
      const validFallbackUrls = await this.validateImageUrls(fallbackUrls);
      
      if (validFallbackUrls.length === 0) {
        console.warn('⚠️ [OPENAI_API] Aucune URL alternative valide, retour fallback');
        return JSON.stringify({ imageUrl: '' });
      }

      // Nouveau tentatif avec URLs alternatives
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          prompt.systemRole,
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt.userRole.content,
              },
              ...validFallbackUrls.map((url) => ({
                type: "image_url",
                image_url: { url },
              })),
            ],
          }],
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('❌ [OPENAI_API] Échec du retry:', error);
      return JSON.stringify({ imageUrl: '' });
    }
  }

  /**
   * Génère des URLs alternatives avec différents paramètres
   * @param originalUrls URLs originales
   * @returns URLs alternatives
   */
  private generateFallbackUrls(originalUrls: string[]): string[] {
    return originalUrls.map(url => {
      // Pour les URLs Pexels, essayer différents paramètres de qualité
      if (url.includes('pexels.com')) {
        return url.replace('auto=compress&cs=tinysrgb&h=350', 'auto=compress&cs=tinysrgb&w=800');
      }
      
      // Pour d'autres URLs, essayer de supprimer les paramètres de compression
      return url.split('?')[0] + '?auto=format&fit=crop&w=800';
    });
  }

  /**
   * Décrit une image en utilisant OpenAI Vision API
   * @param imageUrl URL de l'image à analyser
   * @returns Description courte de l'image (max 50 chars pour SEO)
   */
  async describeImage(imageUrl: string): Promise<string | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en description d'images pour le référencement SEO. Génère une description courte (maximum 8 mots) qui décrit précisément le contenu de l'image pour un nom de fichier SEO. Utilise uniquement des mots simples en français, sans articles."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Décris cette image en maximum 8 mots pour créer un nom de fichier SEO optimisé pour un blog de jardinage."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 50
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('❌ Erreur OpenAI Vision:', error);
      return null;
    }
  }


}
