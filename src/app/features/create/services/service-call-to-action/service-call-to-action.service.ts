import { inject, Injectable } from '@angular/core';
import { Observable, from, switchMap, catchError, of } from 'rxjs';
import { LoggingService } from '../../../../shared/services/logging.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { extractJSONBlock } from '../../utils/cleanJsonObject';
import { SERVICE_MAPPINGS } from '../../../../shared/constants/services';

interface ServiceCTA {
  url: string;
  cta_text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceCallToActionService {
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);

  /**
   * Analyse l'article et ajoute un call-to-action vers le service le plus pertinent
   * @param article - L'article à enrichir
   * @returns Observable de l'article avec le CTA ajouté avant </article>
   */
  addServiceCallToAction(article: string): Observable<string> {
    this.loggingService.info('SERVICE_CTA', '🎯 Analyse de l\'article pour trouver le service le plus pertinent');

    // Préparer les services pour l'IA (URL + description)
    const services = SERVICE_MAPPINGS.map(s => ({
      url: s.url,
      description: s.description
    }));

    // Appeler DeepSeek pour analyser
    const prompts = {
      systemRole: this.getPromptsService.getPromptAnalyzeServiceForArticle().systemRole,
      userRole: this.getPromptsService.getPromptUserAnalyzeServiceForArticle(article, services)
    };

    return from(this.openaiApiService.fetchData(prompts, true, 'service-cta')).pipe(
      switchMap(result => {
        if (!result) {
          this.loggingService.warn('SERVICE_CTA', '⚠️ Pas de résultat de l\'IA, article non modifié');
          return of(article);
        }

        try {
          // Parser la réponse JSON
          const data: ServiceCTA = JSON.parse(extractJSONBlock(result));
          
          if (!data.url || !data.cta_text) {
            this.loggingService.warn('SERVICE_CTA', '⚠️ Données invalides, article non modifié');
            return of(article);
          }

          // Trouver le service correspondant à l'URL
          const service = SERVICE_MAPPINGS.find(s => s.url === data.url);
          
          // Insérer le CTA juste avant </article>
          const ctaHtml = this.generateCTAHtml(data.url, data.cta_text, service?.key);
          // Remplacer </article> par le CTA + </article>
          const enrichedArticle = article.replace('</article>', ctaHtml + '\n</article>');

          this.loggingService.info('SERVICE_CTA', '✅ CTA ajouté avec succès', { url: data.url, key: service?.key });
          return of(enrichedArticle);

        } catch (error) {
          this.loggingService.error('SERVICE_CTA', '❌ Erreur parsing JSON', error);
          return of(article);
        }
      }),
      catchError(error => {
        this.loggingService.error('SERVICE_CTA', '❌ Erreur lors de l\'analyse du service', error);
        return of(article); // En cas d'erreur, retourner l'article non modifié
      })
    );
  }

  /**
   * Génère le HTML du CTA avec un design moderne et attractif + CSS inline
   */
  private generateCTAHtml(url: string, ctaText: string, serviceKey?: string): string {
    // Générer le texte du lien basé sur le key du service
    const linkText = serviceKey ? this.generateLinkText(serviceKey) : 'Découvrir nos services';
    
    // IMPORTANT: HTML minifié avec styles inline pour forcer l'affichage
    return `<div style="margin:32px 0;border-radius:16px;background:linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%);border:2px solid #4caf50;box-shadow:0 4px 20px rgba(76,175,80,0.15);overflow:hidden;transition:transform 0.3s ease, box-shadow 0.3s ease;"><div style="display:flex;align-items:center;gap:24px;padding:24px;"><div style="font-size:48px;line-height:1;animation:pulse 2s ease-in-out infinite;flex-shrink:0;">🌱</div><div style="flex:1;"><h3 style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:#2e7d32;font-family:'Segoe UI',sans-serif;">💡 Conseil d'expert</h3><p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#495057;font-family:'Segoe UI',sans-serif;">${ctaText}</p><a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:linear-gradient(135deg,#4caf50 0%,#388e3c 100%);color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(76,175,80,0.3);"><span>${linkText}</span><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="transition:transform 0.3s ease;"><path d="M8 0L6.59 1.41L12.17 7H0v2h12.17l-5.58 5.59L8 16l8-8z"/></svg></a></div></div></div>`;
  }

  /**
   * Convertit un key de service en texte lisible pour le lien
   */
  private generateLinkText(key: string): string {
    const keyMapping: Record<string, string> = {
      'entretien-jardin': 'Découvrir notre service d\'entretien de jardin',
      'creation-amenagement': 'Découvrir notre service de création et aménagement',
      'plantations-resilientes': 'Découvrir notre service de plantations résiliantes',
      'taille-haie': 'Découvrir notre service de taille de haie',
      'culture-potagere': 'Découvrir notre service de potager urbain',
      'tonte-pelouse': 'Découvrir notre service de tonte de pelouse',
      'elagage-abatage': 'Découvrir notre service d\'élagage et abattage',
      'travaux-terrassement': 'Découvrir notre service de terrassement',
      'robot-tondeuse': 'Découvrir notre service de robot tondeuse'
    };
    
    return keyMapping[key] || 'Découvrir nos services';
  }
}

