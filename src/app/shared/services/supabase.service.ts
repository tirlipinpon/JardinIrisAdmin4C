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

} 