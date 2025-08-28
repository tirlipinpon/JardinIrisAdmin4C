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

} 