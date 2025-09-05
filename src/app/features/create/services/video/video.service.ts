import { inject, Injectable } from '@angular/core';
import { Observable, from, of, switchMap } from 'rxjs';
import { LoggingService } from '../../../../shared/services/logging.service';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { GoogleSearchService, VideoInfo } from '../google-search/google-search.service';
import { extractJSONBlock } from '../../utils/cleanJsonObject';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);
  private readonly googleSearchService = inject(GoogleSearchService);

  findBestVideoUrl(phraseAccroche: string, useMock = false): Observable<string> {
    const prompt = this.getPromptsService.generateKeyWordForSearchVideo(phraseAccroche);
    return from(this.openaiApiService.fetchData(prompt, true, 'video keyword')).pipe(
      switchMap(result => {
        if (!result) return of('');
        try {
          const keywordData: { keywords: string } = JSON.parse(extractJSONBlock(result));
          const keywords = keywordData.keywords;
          if (!keywords) return of('');
          return this.googleSearchService.searchFrenchVideo(keywords).pipe(
            switchMap((videoUrls: VideoInfo[]) => {
              if (!videoUrls.length) return of('');
              const videoPrompt = this.getPromptsService.searchVideoFromYoutubeResult(phraseAccroche, videoUrls);
              return from(this.openaiApiService.fetchData(videoPrompt, true, 'video choose')).pipe(
                switchMap(videoResult => {
                  const videoData: { video: string } = JSON.parse(extractJSONBlock(videoResult));
                  const url = videoData.video && videoData.video.length ? videoData.video : '';
                  return of(url);
                })
              );
            })
          );
        } catch {
          return of('');
        }
      })
    );
  }
}


