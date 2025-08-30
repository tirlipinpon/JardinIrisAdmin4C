import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from '../../../../../../environment';


export interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsImage[];
  total_results: number;
  next_page?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PexelsApiService {

  private readonly apiKey = environment.pexelsApi || '';
  private readonly baseUrl = 'https://api.pexels.com/v1';

  searchImages(query: string, perPage: number = 10): Observable<PexelsImage[]> {
    return from(this.fetchImages(query, perPage));
  }

  private async fetchImages(query: string, perPage: number): Promise<PexelsImage[]> {
    if (!this.apiKey) {
      console.warn('PEXELS_API: Clé API manquante');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&locale=en-US`,
        {
          headers: {
            'Authorization': this.apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur Pexels API: ${response.status} ${response.statusText}`);
      }

      const data: PexelsResponse = await response.json();
      return data.photos || [];
    } catch (error) {
      console.error('PEXELS_API: Erreur lors de la recherche d\'images', error);
      return [];
    }
  }
}
