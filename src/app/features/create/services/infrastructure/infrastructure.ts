import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class Infrastructure {
  private readonly supabaseService = inject(SupabaseService);

  getNextPostId(): Observable<number | PostgrestError> {
    const shouldReturnError = false
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Impossible de récupérer le prochain ID de post',
        details: 'Simulation d\'une erreur Postgrest pour tester la gestion d\'erreur',
        hint: 'Vérifiez la connexion à la base de données',
        code: 'TEST_ERROR_001',
        name: 'PostgrestError'
      };
      return from(Promise.resolve(mockError));
    } else {
      return from(this.supabaseService.getNextPostId());
    }
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
}
