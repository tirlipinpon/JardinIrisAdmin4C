import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { LoggingService } from '../../../../shared/services/logging.service';

@Injectable({
  providedIn: 'root'
})
export class Infrastructure {
  private readonly supabaseService = inject(SupabaseService);
  private readonly loggingService = inject(LoggingService);

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

  // Méthodes factices pour les champs de la table post
  setTitre(): Observable<string | PostgrestError> {
    const dummyTitre = 'Comment créer un jardin bio en permaculture';
    return from(Promise.resolve(dummyTitre));
  }

  setDescriptionMeteo(): Observable<string | PostgrestError> {
    const meteoData = 'Météo du jour: Ensoleillé avec quelques nuages - Température: 22°C, Humidité: 65%';
    return from(Promise.resolve(meteoData));
  }

  setPhraseAccroche(): Observable<string | PostgrestError> {
    const dummyPhrase = "Découvrez les secrets d'un jardin bio qui respecte la nature et vous nourrit toute l'année.";
    return from(Promise.resolve(dummyPhrase));
  }

  setArticle(): Observable<string | PostgrestError> {
    const dummyArticle = `La permaculture est une approche holistique du jardinage qui imite les écosystèmes naturels.

## Les principes de base

1. **Observer et interagir** : Comprendre votre environnement
2. **Capturer et stocker l'énergie** : Utiliser le soleil, l'eau, le vent
3. **Obtenir une production** : Récolter les fruits de votre travail
4. **Appliquer l'auto-régulation** : Laisser la nature s'équilibrer

## Techniques pratiques

- **Compostage** : Recycler les déchets organiques
- **Paillage** : Protéger le sol et retenir l'humidité
- **Association de plantes** : Créer des synergies naturelles
`;
    return from(Promise.resolve(dummyArticle));
  }

  setNewHref(): Observable<string | PostgrestError> {
    const seoUrl = '/blog/comment-creer-jardin-bio-permaculture';
    return from(Promise.resolve(seoUrl));
  }

  setCitation(): Observable<string | PostgrestError> {
    const formattedCitation = '"La permaculture est l\'art de créer des écosystèmes durables" - Bill Mollison';
    return from(Promise.resolve(formattedCitation));
  }

  setLienUrlArticle(): Observable<string | PostgrestError> {
    const dummyUrl = 'https://www.un-jardin-bio.com/permaculture-durable';
    return from(Promise.resolve(dummyUrl));
  }

  setImageUrl(): Observable<string | PostgrestError> {
    const generatedImageUrl = 'https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Jardin+Bio+Permaculture';
    return from(Promise.resolve(generatedImageUrl));
  }

  setCategorie(): Observable<string | PostgrestError> {
    const validatedCategory = 'permaculture';
    return from(Promise.resolve(validatedCategory));
  }

  setVideo(): Observable<string | PostgrestError> {
    const youtubeVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    return from(Promise.resolve(youtubeVideoUrl));
  }

  setPostTitreAndId(): Observable<{ titre: string; id: number; new_href: string }[] | PostgrestError> {
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
