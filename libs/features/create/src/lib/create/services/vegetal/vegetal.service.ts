import { inject, Injectable } from '@angular/core';
import { Observable, from, switchMap, map } from 'rxjs';
import { LoggingService } from '@jardin-iris/core/data-access';
import { GetPromptsService } from '../get-prompts/get-prompts.service';
import { OpenaiApiService } from '../openai-api/openai-api.service';
import { AddScientificNameService } from '../add-scientific-name/add-scientific-name.service';
import { extractJSONBlock } from '../../utils/cleanJsonObject';

@Injectable({ providedIn: 'root' })
export class VegetalService {
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);
  private readonly addScientificNameService = inject(AddScientificNameService);

  enrichArticleWithBotanicalNames(article: string, useMock = false): Observable<string> {

    const prompt = this.getPromptsService.getPromptAddVegetalInArticle(article, 0);
    return from(this.openaiApiService.fetchData(prompt, false, 'vegetal global')).pipe(
      switchMap(result => {
        if (!result) {
          return this.addScientificNameService.processAddUrlFromScientificNameInHtml(article);
        }
        try {
          const data: { upgraded: string } = JSON.parse(extractJSONBlock(result));
          const upgraded = data.upgraded || article;
          return this.addScientificNameService.processAddUrlFromScientificNameInHtml(upgraded);
        } catch {
          return this.addScientificNameService.processAddUrlFromScientificNameInHtml(article);
        }
      }),
      map(finalArticle => {
        this.loggingService.info('VEGETAL_SVC', '📨 Vegetal terminé');
        return finalArticle;
      })
    );
  }
}


