import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map, catchError } from 'rxjs';
import { LoggingService } from './logging.service';
import { PostImageInjectorService } from './post-image-injector.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PostValidationService {
  private readonly loggingService = inject(LoggingService);
  private readonly postImageInjectorService = inject(PostImageInjectorService);
  private readonly supabaseService = inject(SupabaseService);

  /**
   * Valide et injecte les images dans un post
   * @param postId ID du post
   * @param articleContent Contenu de l'article
   * @returns Observable avec le contenu modifié
   */
  injectImagesAndValidate(postId: number, articleContent: string): Observable<{
    content: string;
    imagesInjected: number;
    imagesAdded: number;
    contentChanged: boolean;
  }> {
    this.loggingService.info('PostValidationService', '🖼️ Début de l\'injection d\'images', {
      postId,
      articleLength: articleContent.length
    });

    // Récupérer les images des chapitres depuis la base de données
    return this.supabaseService.getImagesChapitres(postId).pipe(
      switchMap(imagesChapitres => {
        this.loggingService.info('PostValidationService', '📊 Données du post', {
          postId,
          articleLength: articleContent.length,
          imagesChapitresCount: imagesChapitres.length,
          imagesChapitres
        });

        // Compter les images déjà présentes
        const originalImagesCount = this.countExistingImages(articleContent);
        
        // Injecter les images
        const result = this.postImageInjectorService.injectImagesIntoPost(
          postId,
          articleContent,
          imagesChapitres
        );

        // Compter les nouvelles images
        const newImagesCount = this.postImageInjectorService.countInjectedImages(result.content);
        const imagesAdded = newImagesCount - originalImagesCount;
        const contentChanged = result.content !== articleContent;

        this.loggingService.info('PostValidationService', '📈 Résultat de l\'injection', {
          postId,
          originalImagesCount,
          newImagesCount,
          imagesAdded,
          contentChanged
        });

        return of({
          content: result.content,
          imagesInjected: result.imagesInjected,
          imagesAdded,
          contentChanged
        });
      }),
      catchError(error => {
        this.loggingService.error('PostValidationService', '❌ Erreur lors de l\'injection des images', error);
        return of({
          content: articleContent,
          imagesInjected: 0,
          imagesAdded: 0,
          contentChanged: false
        });
      })
    );
  }

  /**
   * Met à jour le contenu de l'article dans la base de données
   * @param postId ID du post
   * @param content Contenu modifié
   * @returns Observable avec le résultat
   */
  updateArticleContent(postId: number, content: string): Observable<boolean> {
    this.loggingService.info('PostValidationService', '💾 Mise à jour du contenu de l\'article', {
      postId,
      contentLength: content.length
    });

    return this.supabaseService.updatePostContent(postId, content).pipe(
      map(() => {
        this.loggingService.info('PostValidationService', '✅ Contenu de l\'article mis à jour avec succès');
        return true;
      }),
      catchError(error => {
        this.loggingService.error('PostValidationService', '❌ Erreur lors de la mise à jour du contenu', error);
        return of(false);
      })
    );
  }

  /**
   * Compte le nombre d'images existantes dans le contenu
   * @param content Contenu de l'article
   * @returns Nombre d'images
   */
  private countExistingImages(content: string): number {
    const imageRegex = /<img[^>]*class=['"]randomCropImage['"][^>]*>/gi;
    const matches = content.match(imageRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Valide qu'un post a été correctement traité
   * @param postId ID du post
   * @returns Observable avec le résultat de validation
   */
  validatePostById(postId: number): Observable<boolean> {
    this.loggingService.info('PostValidationService', '🔍 Validation du post', { postId });

    return this.supabaseService.getPostById(postId).pipe(
      map(post => {
        if (!post) {
          this.loggingService.warn('PostValidationService', 'Post non trouvé', { postId });
          return false;
        }

        // Vérifier que le post a du contenu
        if (!post.article || post.article.trim().length === 0) {
          this.loggingService.warn('PostValidationService', 'Post sans contenu', { postId });
          return false;
        }

        // Vérifier qu'il y a des images
        const imageCount = this.countExistingImages(post.article);
        if (imageCount === 0) {
          this.loggingService.warn('PostValidationService', 'Post sans images', { postId, imageCount });
          return false;
        }

        this.loggingService.info('PostValidationService', '✅ Post validé avec succès', {
          postId,
          contentLength: post.article.length,
          imageCount
        });

        return true;
      }),
      catchError(error => {
        this.loggingService.error('PostValidationService', '❌ Erreur lors de la validation du post', error);
        return of(false);
      })
    );
  }
}
