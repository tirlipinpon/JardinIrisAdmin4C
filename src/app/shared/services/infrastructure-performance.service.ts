import { Injectable, inject } from '@angular/core';
import { PerformanceService } from './performance.service';
import { Infrastructure } from '../../features/create/components/infrastructure/infrastructure';
import { Observable } from 'rxjs';
import { PostgrestError } from '@supabase/supabase-js';
import { Post } from '../../features/create/types/post';
import { InternalImageData } from '../../features/create/types/internalImageData';

@Injectable({
  providedIn: 'root'
})
export class InfrastructurePerformanceService {
  private readonly performanceService = inject(PerformanceService);
  private readonly infrastructure = inject(Infrastructure);

  // Wrapper pour getNextPostId
  getNextPostId(): Observable<number | PostgrestError> {
    return this.performanceService.measure(
      'getNextPostId',
      'Database',
      () => this.infrastructure.getNextPostId()
    );
  }

  // Wrapper pour getLastPostTitreAndId
  getLastPostTitreAndId(): Observable<{ titre: string; id: number; new_href: string }[] | PostgrestError> {
    return this.performanceService.measure(
      'getLastPostTitreAndId',
      'Database',
      () => this.infrastructure.getLastPostTitreAndId()
    );
  }

  // Wrapper pour setPost
  setPost(articleIdea: string): Observable<Post | PostgrestError> {
    return this.performanceService.measure(
      'setPost',
      'API External',
      () => this.infrastructure.setPost(articleIdea)
    );
  }

  // Wrapper pour setImageUrl
  setImageUrl(phraseAccroche: string, postId: number): Observable<string | PostgrestError> {
    return this.performanceService.measure(
      'setImageUrl',
      'Image Processing',
      () => this.infrastructure.setImageUrl(phraseAccroche, postId)
    );
  }

  // Wrapper pour setVideo
  setVideo(phrase_accroche: string, postId: number): Observable<string | PostgrestError> {
    return this.performanceService.measure(
      'setVideo',
      'Video Processing',
      () => this.infrastructure.setVideo(phrase_accroche, postId)
    );
  }

  // Wrapper pour setFaq
  setFaq(article: string): Observable<{ question: string; response: string }[] | PostgrestError> {
    return this.performanceService.measure(
      'setFaq',
      'Text Processing',
      () => this.infrastructure.setFaq(article)
    );
  }

  // Wrapper pour internalImage
  internalImage(article: string, postId: number): Observable<{ article: string; images: InternalImageData[] } | PostgrestError> {
    return this.performanceService.measure(
      'internalImage',
      'Image Processing',
      () => this.infrastructure.internalImage(article, postId)
    );
  }

  // Wrapper pour setInternalLink
  setInternalLink(article: string, postTitreAndId: { titre: string; id: number; new_href: string }[]): Observable<string | PostgrestError> {
    return this.performanceService.measure(
      'setInternalLink',
      'Text Processing',
      () => this.infrastructure.setInternalLink(article, postTitreAndId)
    );
  }

  // Wrapper pour vegetal
  vegetal(article: string): Observable<string | PostgrestError> {
    return this.performanceService.measure(
      'vegetal',
      'Text Processing',
      () => this.infrastructure.vegetal(article)
    );
  }

  // Wrapper pour addServiceCallToAction
  addServiceCallToAction(article: string): Observable<string | PostgrestError> {
    return this.performanceService.measure(
      'addServiceCallToAction',
      'Text Processing',
      () => this.infrastructure.addServiceCallToAction(article)
    );
  }

  // Wrapper pour addProjectCallToAction
  addProjectCallToAction(article: string): Observable<string | PostgrestError> {
    return this.performanceService.measure(
      'addProjectCallToAction',
      'Text Processing',
      () => this.infrastructure.addProjectCallToAction(article)
    );
  }

  // Wrapper pour savePostComplete
  savePostComplete(post: Post): Observable<boolean | PostgrestError> {
    return this.performanceService.measure(
      'savePostComplete',
      'Database',
      () => this.infrastructure.savePostComplete(post)
    );
  }

  // Wrapper pour saveFaqItems
  saveFaqItems(postId: number, faqItems: { question: string; response: string }[]): Observable<boolean | PostgrestError> {
    return this.performanceService.measure(
      'saveFaqItems',
      'Database',
      () => this.infrastructure.saveFaqItems(postId, faqItems)
    );
  }

  // Wrapper pour saveInternalImages
  saveInternalImages(postId: number, images: InternalImageData[]): Observable<boolean | PostgrestError> {
    return this.performanceService.measure(
      'saveInternalImages',
      'Database',
      () => this.infrastructure.saveInternalImages(postId, images)
    );
  }
}
