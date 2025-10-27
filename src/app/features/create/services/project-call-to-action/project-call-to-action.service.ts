import { inject, Injectable } from '@angular/core';
import { Observable, from, switchMap, catchError, of } from 'rxjs';
import { LoggingService } from '../../../../shared/services/logging.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { extractJSONBlock } from '../../utils/cleanJsonObject';
import { PROJECT_MAPPINGS } from '../../../../shared/constants/services';

interface ProjectCTA {
  url: string;
  cta_text: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectCallToActionService {
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);

  /**
   * Analyse l'article et ajoute un call-to-action vers le projet le plus pertinent
   * @param article - L'article à enrichir
   * @returns Observable de l'article avec le CTA ajouté avant la dernière </article>
   */
  addProjectCallToAction(article: string): Observable<string> {
    this.loggingService.info('PROJECT_CTA', '🎯 Analyse de l\'article pour trouver le projet le plus pertinent');

    // Préparer les projets pour l'IA (URL + titre + description)
    const projects = PROJECT_MAPPINGS.map(p => ({
      url: p.url,
      title: p.title,
      description: p.description
    }));

    // Appeler DeepSeek pour analyser
    const prompts = {
      systemRole: this.getPromptsService.getPromptAnalyzeProjectForArticle().systemRole,
      userRole: this.getPromptsService.getPromptUserAnalyzeProjectForArticle(article, projects)
    };

    return from(this.openaiApiService.fetchData(prompts, true, 'project-cta')).pipe(
      switchMap(result => {
        if (!result) {
          this.loggingService.warn('PROJECT_CTA', '⚠️ Pas de résultat de l\'IA, article non modifié');
          return of(article);
        }

        try {
          // Parser la réponse JSON
          const data: ProjectCTA = JSON.parse(extractJSONBlock(result));
          
          if (!data.url || !data.cta_text || !data.title) {
            this.loggingService.warn('PROJECT_CTA', '⚠️ Données invalides, article non modifié');
            return of(article);
          }

          // Trouver le projet correspondant à l'URL
          const project = PROJECT_MAPPINGS.find(p => p.url === data.url);
          
          // Insérer le CTA à la fin de l'article (après tous les paragraphes)
          const ctaHtml = this.generateCTAHtml(data.url, data.cta_text, data.title, project?.key);
          
          // Ajouter le CTA directement à la fin de l'article
          const enrichedArticle = article + ctaHtml;
          
          this.loggingService.info('PROJECT_CTA', '✅ CTA ajouté à la fin de l\'article', { url: data.url, key: project?.key });
          return of(enrichedArticle);

        } catch (error) {
          this.loggingService.error('PROJECT_CTA', '❌ Erreur parsing JSON', error);
          return of(article);
        }
      }),
      catchError(error => {
        this.loggingService.error('PROJECT_CTA', '❌ Erreur lors de l\'analyse du projet', error);
        return of(article); // En cas d'erreur, retourner l'article non modifié
      })
    );
  }

  /**
   * Génère le HTML du CTA avec un design moderne et attractif (différent du service-cta) + CSS inline
   */
  private generateCTAHtml(url: string, ctaText: string, title: string, projectKey?: string): string {
    // Générer le texte du lien basé sur le key du projet
    const linkText = projectKey ? this.generateLinkText(projectKey) : 'Découvrir nos projets';
    
    // IMPORTANT: HTML minifié avec styles inline pour forcer l'affichage
    return `<div style="margin:32px 0;border-radius:16px;background:linear-gradient(135deg,#fff5e8 0%,#ffe8d1 100%);border:2px solid #ff9800;box-shadow:0 4px 20px rgba(255,152,0,0.15);overflow:hidden;transition:transform 0.3s ease, box-shadow 0.3s ease;"><div style="display:flex;align-items:center;gap:24px;padding:24px;"><div style="font-size:48px;line-height:1;animation:sparkle 2s ease-in-out infinite;flex-shrink:0;">✨</div><div style="flex:1;"><h3 style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:#cc7a00;font-family:'Segoe UI',sans-serif;">🏗️ Projet inspirant</h3><p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#495057;font-family:'Segoe UI',sans-serif;">${ctaText}</p><a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:linear-gradient(135deg,#ff9800 0%,#f57c00 100%);color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(255,152,0,0.3);"><span>${linkText}</span><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="transition:transform 0.3s ease;"><path d="M8 0L6.59 1.41L12.17 7H0v2h12.17l-5.58 5.59L8 16l8-8z"/></svg></a></div></div></div>`;
  }

  /**
   * Convertit un key de projet en texte lisible pour le lien
   */
  private generateLinkText(key: string): string {
    const keyMapping: Record<string, string> = {
      'creation-jardin-etterbeek': 'Voir le projet de création de jardin',
      'maison-horta': 'Découvrir le jardin Horta',
      'potager-urbain': 'Voir le potager urbain',
      'amenagement-jardin': 'Découvrir l\'aménagement de jardin',
      'entretien-jardin-uccle': 'Voir l\'entretien du jardin'
    };
    
    return keyMapping[key] || 'Découvrir nos projets';
  }
}

