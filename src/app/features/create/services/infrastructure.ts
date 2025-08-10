import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class Infrastructure {
  private readonly supabaseService = inject(SupabaseService);

  test(url_post: string): Observable<any> {
    return from(this.supabaseService.getFirstIdeaPostByMonth(new Date().getMonth(), new Date().getFullYear())).pipe(
      map((result: any) => {
        if ('id' in result) {
          return result;
        } else {
          console.error('Erreur lors de la récupération des idées:', result);
          throw result;
        }
      })
    );
  }
  
}
