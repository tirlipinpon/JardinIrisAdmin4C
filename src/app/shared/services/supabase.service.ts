import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { environment } from '../../../../environment';


@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getFirstIdeaPostByMonth(month: number, year: number): Promise<{
    id: number | null, "description": string | null  } | PostgrestError> {
    const {data, error} = await this.client
      .from('ideaPost')
      .select('id, description')
      .gte('created_at', `${year}-${month.toString().padStart(2, '0')}-01`) // Ajout de padStart pour le format
      .lt('created_at', `${year}-${(month + 1).toString().padStart(2, '0')}-01`) // Gestion du mois suivant
      .eq('deleted', false)
      .order('created_at', {ascending: false})
      .limit(1);

    if (error) {
      console.log(' Erreur lors de la récupération des posts: ' + (error))
      return error
    } else {
      console.log("getFirstIdeaPostByMonth = " + JSON.stringify(data, null, 2))
      return data.length > 0 ? data[0] : {id: null, description: null};
    }
  }

  async getNextPostId(): Promise<number | PostgrestError> {
    const { data, error } = await this.client.rpc('get_next_post_id');
    if (error) return error;
    return data as number;
  }

  async getLastPostTitreAndId(limit: number = 10): Promise<{ titre: string; id: number; new_href: string }[] | PostgrestError> {
    const { data, error } = await this.client
      .from('post')
      .select('id, titre, new_href')
      .eq('deleted', false)
      .eq('valid', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.log('Erreur lors de la récupération des posts: ' + error.message);
      return error;
    } else {
      // console.log("getLastPostTitreAndId = " + JSON.stringify(data, null, 2));
      return data as { titre: string; id: number; new_href: string }[];
    }
  }

  async uploadBase64ToSupabase(postId: number, b64_json: string): Promise<string | null> {
    try {
      // 1️⃣ Convertir le base64 en Uint8Array
      const byteCharacters = atob(b64_json);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);

      // 2️⃣ Upload direct dans Supabase Storage
      const { data, error } = await this.client.storage
        .from(environment.supabaseBucket)
        .upload(`${postId}.png`, byteArray, {
          contentType: "image/png",
          upsert: true,
        });

      if (error) throw error;

      // 3️⃣ Récupérer l’URL publique
      const { data: publicUrlData } = this.client.storage
        .from(environment.supabaseBucket)
        .getPublicUrl(`${postId}.png`);

      return publicUrlData?.publicUrl || null;
    } catch (err) {
      console.error("Erreur uploadBase64ToSupabase:", err);
      return null;
    }
  }

  async updateImageUrlPostByIdForm(idPost: number, json64: string) {
    try {
      const {data, error} = await this.client
        .from('post')
        .update({image_url: json64})
        .eq('id', idPost)
        .select()

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async setNewUrlImagesChapitres(url: string, chapitreId: number, postId: number, chapitreKeyWord: string, chapitreExplanationWord: string): Promise<any> {
    try {
      const {data, error} = await this.client
        .from('urlImagesChapitres')
        .insert([
          {
            fk_post: postId,
            url_Image: url,
            chapitre_id: chapitreId,
            chapitre_key_word: chapitreKeyWord,
            explanation_word: chapitreExplanationWord
          }
        ]);

      if (error) {
        console.error('Erreur lors de l\'insertion des données:', error);
      } else {
        console.log('Données insérées avec succès:', JSON.stringify(data));
      }

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updatePostComplete(post: any): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('post')
        .insert({
          id: post.id,
          titre: post.titre,
          description_meteo: post.description_meteo,
          phrase_accroche: post.phrase_accroche,
          article: post.article,
          citation: post.citation,
          lien_url_article: post.lien_url_article,
          categorie: post.categorie,
          new_href: post.new_href,
          video: post.video,
          image_url: post.image_url,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de l\'insertion du post:', error);
        throw error;
      }
      
      console.log('Post inséré avec succès:', data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async saveFaqForPost(postId: number, faqItems: { question: string; response: string }[]): Promise<any> {
    try {
      const faqData = faqItems.map(item => ({
        fk_post_id: postId,
        question: item.question,
        response: item.response
      }));

      const { data, error } = await this.client
        .from('faq')
        .insert(faqData);

      if (error) {
        console.error('Erreur lors de l\'insertion de la FAQ:', error);
        throw error;
      }
      
      console.log('FAQ sauvegardée avec succès:', data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // ============================================================================
  // 🖼️ MÉTHODES POUR LES IMAGES DE CHAPITRES
  // ============================================================================

  /**
   * Méthode utilitaire : Télécharge une image depuis une URL externe
   * @param imageUrl URL externe de l'image (Pexels, etc.)
   * @returns Uint8Array contenant les données de l'image
   */
  async downloadExternalImage(imageUrl: string): Promise<Uint8Array> {
    console.log('📥 Téléchargement image externe:', imageUrl);
    
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      console.log('✅ Image téléchargée:', {
        taille: uint8Array.length,
        type: blob.type
      });
      
      return uint8Array;
    } catch (error) {
      console.error('❌ Échec téléchargement image:', error);
      throw error;
    }
  }

  /**
   * Méthode utilitaire : Upload une image dans Supabase Storage
   * @param fileName Chemin complet du fichier (avec dossier postId)
   * @param imageData Données de l'image en Uint8Array
   * @param contentType Type MIME de l'image
   * @returns URL publique de l'image ou null si échec
   */
  async uploadImageToStorage(
    fileName: string,
    imageData: Uint8Array,
    contentType: string = 'image/png'
  ): Promise<string | null> {
    console.log('📤 Upload vers Storage:', {
      fileName,
      taille: imageData.length
    });
    
    try {
      // Upload dans le bucket (avec chemin incluant le dossier postId)
      const { data, error } = await this.client.storage
        .from('jardin-iris-images-post')
        .upload(fileName, imageData, {
          contentType: contentType,
          upsert: true,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('❌ Erreur Storage upload:', error);
        throw error;
      }
      
      // Récupérer l'URL publique
      const { data: publicUrlData } = this.client.storage
        .from('jardin-iris-images-post')
        .getPublicUrl(fileName);
      
      const urlPublique = publicUrlData?.publicUrl;
      
      if (!urlPublique) {
        console.error('❌ Impossible de récupérer URL publique');
        return null;
      }
      
      console.log('✅ Upload réussi:', urlPublique);
      return urlPublique;
    } catch (error) {
      console.error('❌ Échec upload Storage:', error);
      return null;
    }
  }

  /**
   * Upload une image de chapitre dans Supabase Storage
   * Télécharge l'image externe, l'upload dans Storage et retourne l'URL
   * Structure: {postId}/{postId}_chapitre_{chapitreId}_{timestamp}.png
   * 
   * @param postId ID du post
   * @param chapitreId ID du chapitre
   * @param externalImageUrl URL externe de l'image (Pexels, etc.)
   * @returns URL publique depuis Storage ou null si échec
   */
  async uploadInternalImageToStorage(
    postId: number,
    chapitreId: number,
    externalImageUrl: string
  ): Promise<string | null> {
    console.log('🖼️ Début upload image interne:', {
      postId,
      chapitreId,
      source: externalImageUrl
    });
    
    try {
      // 1. Générer le nom de fichier avec chemin complet (dossier postId)
      const timestamp = Date.now();
      const fileName = `${postId}/${postId}_chapitre_${chapitreId}_${timestamp}.png`;
      
      console.log('📁 Chemin de fichier généré:', fileName);
      
      // 2. Télécharger l'image externe
      const imageData = await this.downloadExternalImage(externalImageUrl);
      
      // 3. Uploader dans Storage
      const storageUrl = await this.uploadImageToStorage(
        fileName,
        imageData,
        'image/png'
      );
      
      if (!storageUrl) {
        console.warn('⚠️ Upload Storage échoué, retourne null');
        return null;
      }
      
      console.log('✅ Image interne uploadée avec succès:', {
        storageUrl,
        fileName
      });
      
      return storageUrl;
    } catch (error) {
      console.error('❌ Erreur complète upload image interne:', {
        postId,
        chapitreId,
        error
      });
      return null;
    }
  }

} 