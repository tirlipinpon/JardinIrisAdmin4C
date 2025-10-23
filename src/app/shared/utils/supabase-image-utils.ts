import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SupabaseImageUtils {

  /**
   * Génère l'URL finale de l'image avec le domaine du site
   * @param originalUrl URL originale de l'image
   * @param postId ID du post
   * @returns URL finale avec le domaine du site
   */
  generateFinalImageUrl(originalUrl: string, postId: number): string {
    // Si c'est une URL Supabase, extraire le nom de fichier et reconstruire l'URL
    if (originalUrl.includes('supabase.co')) {
      const filename = this.extractFilenameFromSupabaseUrl(originalUrl);
      const finalUrl = `https://www.jardin-iris.be/image-blog/${postId}/${filename}`;
      
      console.log('SupabaseImageUtils Src généré:', {
        originalUrl,
        postId,
        filename,
        generatedSrc: finalUrl
      });
      
      return finalUrl;
    }
    
    // Pour les URLs externes, retourner l'URL originale
    console.log('SupabaseImageUtils URL non-Supabase, retour de l\'URL originale:', {
      url: originalUrl
    });
    
    return originalUrl;
  }

  /**
   * Extrait le nom de fichier d'une URL Supabase
   * @param url URL Supabase
   * @returns Nom de fichier
   */
  private extractFilenameFromSupabaseUrl(url: string): string {
    // Exemple: https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/1043/pommes-rouges-panier-bois-fruits-jardinage-campagn.webp
    // Retourne: pommes-rouges-panier-bois-fruits-jardinage-campagn.webp
    
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Génère le texte alt à partir du mot-clé
   * @param keyWord Mot-clé du chapitre
   * @param url URL de l'image (pour logging)
   * @returns Texte alt généré
   */
  generateAltText(keyWord: string, url: string): string {
    // Convertir le mot-clé en format kebab-case pour l'alt
    const altText = keyWord
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets multiples
      .trim();
    
    console.log('SupabaseImageUtils Alt text généré à partir du key_word:', {
      keyWord,
      altText,
      url
    });
    
    return altText;
  }
}
