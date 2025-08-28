import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { LoggingService } from '../../../../shared/services/logging.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../../services/openai-api/openai-api.service';
import { parseJsonSafe, extractJSONBlock } from '../../utils/cleanJsonObject';
import { Post } from '../../types/post';


@Injectable({
  providedIn: 'root'
})
export class Infrastructure {
  private readonly supabaseService = inject(SupabaseService);
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);

  getNextPostId(): Observable<number | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début getNextPostId()');
    const shouldReturnError = false;
    const shouldReturnMock = false
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Impossible de récupérer le prochain ID de post',
        details: 'Simulation d\'une erreur Postgrest pour tester la gestion d\'erreur',
        hint: 'Vérifiez la connexion à la base de données',
        code: 'TEST_ERROR_001',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée', mockError);
      return from(Promise.resolve(mockError));
    }
    if (shouldReturnMock) { 
      const dummyNextPostId = 666;
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data', { postId: dummyNextPostId });
      return from(Promise.resolve(dummyNextPostId));
    }
  
    return from(this.supabaseService.getNextPostId());
    
  }

  setPost(articleIdea: string): Observable<Post | PostgrestError> {
    const prompt = this.getPromptsService.generateArticle(articleIdea);
    return from(this.openaiApiService.fetchData(prompt, true)).pipe(
      map(result => {
        if (result === null) {
          throw new Error('Aucun résultat retourné par l\'API OpenAI');
        }
        return parseJsonSafe(extractJSONBlock(result));
      })
    );
  }

  setImageUrl(): Observable<string | PostgrestError> {
    const generatedImageUrl = 'https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Jardin+Bio+Permaculture';
    return from(Promise.resolve(generatedImageUrl));
  }


  setVideo(): Observable<string | PostgrestError> {
    const youtubeVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    return from(Promise.resolve(youtubeVideoUrl));
  }

  getPostTitreAndId(): Observable<{ titre: string; id: number; new_href: string }[] | PostgrestError> {
    const mockPostTitreAndId = [
      {
        titre: 'Les 10 plantes indispensables pour débuter en permaculture',
        id: 1,
        new_href: '/blog/10-plantes-indispensables-permaculture'
      },
      {
        titre: 'Comment créer un compost efficace en 30 jours',
        id: 2,
        new_href: '/blog/creer-compost-efficace-30-jours'
      },
      {
        titre: 'Guide complet du paillage au jardin bio',
        id: 3,
        new_href: '/blog/guide-complet-paillage-jardin-bio'
      },
      {
        titre: 'Association de légumes : les meilleures combinaisons',
        id: 4,
        new_href: '/blog/association-legumes-meilleures-combinaisons'
      },
      {
        titre: 'Récupération d\'eau de pluie : techniques et astuces',
        id: 5,
        new_href: '/blog/recuperation-eau-pluie-techniques-astuces'
      }
    ];
    return from(Promise.resolve(mockPostTitreAndId));
  }

  setFaq(): Observable<{ question: string; response: string }[] | PostgrestError> {
    const mockFaq = [
      {
        question: 'Qu\'est-ce que la permaculture ?',
        response: 'La permaculture est une méthode de conception de systèmes agricoles durables qui s\'inspire du fonctionnement des écosystèmes naturels. Elle vise à créer des environnements productifs, stables et résilients.'
      },
      {
        question: 'Combien de temps faut-il pour voir les premiers résultats ?',
        response: 'Les premiers résultats peuvent être visibles dès la première saison pour certaines cultures. Cependant, un système permaculturel mature nécessite généralement 3 à 5 ans pour atteindre son plein potentiel.'
      },
      {
        question: 'Peut-on pratiquer la permaculture sur un petit espace ?',
        response: 'Absolument ! La permaculture peut être adaptée à tous les espaces, même un balcon ou une terrasse. L\'important est d\'optimiser l\'utilisation de l\'espace disponible et de créer des synergies entre les éléments.'
      },
      {
        question: 'Quels sont les outils indispensables pour débuter ?',
        response: 'Pour débuter, vous aurez besoin d\'outils de base : bêche, râteau, sécateur, arrosoir, et quelques contenants pour le compost. L\'investissement peut être progressif selon vos besoins.'
      },
      {
        question: 'Comment gérer les nuisibles sans pesticides ?',
        response: 'La permaculture privilégie la prévention et les solutions naturelles : associations de plantes répulsives, introduction d\'auxiliaires, pièges écologiques, et renforcement de la biodiversité pour maintenir l\'équilibre naturel.'
      }
    ];
    return from(Promise.resolve(mockFaq));
  }
}
