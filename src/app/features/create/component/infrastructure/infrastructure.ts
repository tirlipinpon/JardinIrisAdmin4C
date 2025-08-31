import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap, concatMap, tap, toArray, catchError } from 'rxjs';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { LoggingService } from '../../../../shared/services/logging.service';
import { OpenaiApiService } from '../../services/openai-api/openai-api.service';
import { GoogleSearchService, VideoInfo } from '../../services/google-search/google-search.service';
import { PexelsApiService } from '../../services/pexels-api/pexels-api.service';
import { parseJsonSafe, extractJSONBlock } from '../../utils/cleanJsonObject';
import { Post } from '../../types/post';
import { GetPromptsService } from '../../services/get-prompts/get-prompts.service';
import { environment } from '../../../../../environments/environment';
import { InternalImageData } from '../../types/internalImageData';


@Injectable({
  providedIn: 'root'
})
export class Infrastructure {
  private readonly supabaseService = inject(SupabaseService);
  private readonly loggingService = inject(LoggingService);
  private readonly getPromptsService = inject(GetPromptsService);
  private readonly openaiApiService = inject(OpenaiApiService);
  private readonly googleSearchService = inject(GoogleSearchService);
  private readonly pexelsApiService = inject(PexelsApiService);

  /**
   * Méthode générique pour gérer les erreurs et les transformer en PostgrestError
   * pour un traitement uniforme dans le store
   */
  private handleError(error: any, context: string, methodName: string): PostgrestError {
    this.loggingService.error('INFRASTRUCTURE', `Erreur dans ${methodName} - ${context}`, error);
    
    // Si c'est déjà une PostgrestError, la retourner telle quelle
    if (error && typeof error === 'object' && 'message' in error && 'code' in error && 'name' in error) {
      return error as PostgrestError;
    }
    
    // Créer une PostgrestError standardisée
    const postgrestError: PostgrestError = {
      message: error?.message || `Erreur dans ${methodName}: ${String(error)}`,
      details: `Contexte: ${context}. Erreur originale: ${error?.stack || String(error)}`,
      hint: `Vérifiez les logs pour plus de détails sur l'erreur dans ${methodName}`,
      code: error?.code || `INFRA_ERROR_${methodName.toUpperCase()}`,
      name: 'PostgrestError'
    };
    
    return postgrestError;
  }

  /**
   * Wrapper générique pour les opérations asynchrones avec gestion d'erreur
   */
  private wrapWithErrorHandling<T>(
    operation: () => Observable<T>, 
    methodName: string, 
    context: string = ''
  ): Observable<T | PostgrestError> {
    return operation().pipe(
      catchError(error => {
        const postgrestError = this.handleError(error, context, methodName);
        return of(postgrestError);
      })
    );
  }

  getNextPostId(): Observable<number | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Impossible de récupérer le prochain ID de post',
        details: 'Simulation d\'une erreur Postgrest pour tester la gestion d\'erreur',
        hint: 'Vérifiez la connexion à la base de données',
        code: 'TEST_ERROR_001',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée', mockError);
      return from(Promise.resolve(mockError));
    }
    if (shouldReturnMock) { 
      const dummyNextPostId = 666;
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data', { postId: dummyNextPostId });
      return from(Promise.resolve(dummyNextPostId));
    }
  
    return this.wrapWithErrorHandling(
      () => from(this.supabaseService.getNextPostId()),
      'getNextPostId',
      'Récupération du prochain ID de post depuis Supabase'
    );
  }

  getLastPostTitreAndId(): Observable<{ titre: string; id: number; new_href: string }[] | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Impossible de récupérer les derniers posts',
        details: 'Simulation d\'une erreur lors de la récupération des titres et IDs',
        hint: 'Vérifiez la table posts dans Supabase',
        code: 'TEST_ERROR_002',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour getLastPostTitreAndId', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const dummyPosts = [
        { titre: "Comment créer un jardin écologique en ville ?", id: 665, new_href: "jardin-ecologique-ville-guide-complet" },
        { titre: "Les meilleures plantes vivaces pour un jardin bruxellois", id: 664, new_href: "plantes-vivaces-jardin-bruxelles-selection" },
        { titre: "Cultiver des légumes bio sur balcon : guide pratique", id: 663, new_href: "legumes-bio-balcon-culture-urbaine" },
        { titre: "Arrosage intelligent : économiser l'eau au jardin", id: 662, new_href: "arrosage-intelligent-economie-eau-jardin" },
        { titre: "Compostage domestique : transformer ses déchets en or noir", id: 661, new_href: "compostage-domestique-dechets-organiques" },
        { titre: "Lutter contre les limaces naturellement", id: 660, new_href: "lutte-naturelle-limaces-escargots-jardin" },
        { titre: "Créer une prairie fleurie pour la biodiversité", id: 659, new_href: "prairie-fleurie-biodiversite-pollinisateurs" },
        { titre: "Taille des rosiers : quand et comment procéder", id: 658, new_href: "taille-rosiers-technique-periode-optimale" },
        { titre: "Installer un système de récupération d'eau de pluie", id: 657, new_href: "recuperation-eau-pluie-installation-jardin" },
        { titre: "Permaculture urbaine : principes et applications", id: 656, new_href: "permaculture-urbaine-principes-pratiques" }
      ];
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour getLastPostTitreAndId', { count: dummyPosts.length });
      return from(Promise.resolve(dummyPosts));
    }
    
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début getLastPostTitreAndId()');
    return this.wrapWithErrorHandling(
      () => from(this.supabaseService.getLastPostTitreAndId(10)),
      'getLastPostTitreAndId',
      'Récupération des derniers posts depuis Supabase'
    );
  }

  setPost(articleIdea: string): Observable<Post | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = true;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la génération d\'article',
        details: 'Simulation d\'une erreur lors de la génération d\'article avec OpenAI',
        hint: 'Vérifiez votre clé API OpenAI et les crédits disponibles',
        code: 'TEST_ERROR_003',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour setPost', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const dummyPost: Post = {
        titre: "Comment cultiver des tomates cerises en pot sur son balcon",
        description_meteo: "Aujourd'hui, le ciel est partiellement nuageux avec des températures de 22°C, parfait pour jardiner en extérieur sans risque de coup de soleil.",
        phrase_accroche: "Transformez votre balcon en mini-potager productif ! Découvrez tous les secrets pour réussir la culture des tomates cerises en pot et savourer vos propres légumes bio.",
        article: `<span id='paragraphe-1'><h4>Choisir la bonne variété de tomates cerises pour la culture en pot</h4><article>Pour réussir la culture de tomates cerises sur votre balcon, le choix de la variété est crucial. Je recommande particulièrement les variétés 'Sweet 100', 'Cherry Belle' ou 'Tumbling Tom' qui s'adaptent parfaitement à la culture en contenants. Ces variétés compactes produisent abondamment et résistent bien aux conditions parfois difficiles d'un balcon urbain. <em>La variété 'Sweet 100' peut produire jusqu'à 100 petites tomates par grappe</em>, tandis que 'Tumbling Tom' est idéale pour les jardinières suspendues grâce à son port retombant naturel.</article></span>
<span id='paragraphe-2'><h4>Préparer le substrat et choisir les contenants adaptés</h4><article>Un bon drainage est essentiel pour éviter le pourrissement des racines. Utilisez un mélange composé de 50% de terreau universel, 30% de compost bien décomposé et 20% de perlite ou de vermiculite pour améliorer le drainage. <b>Le contenant doit faire au minimum 40 cm de profondeur et 30 cm de diamètre</b> pour permettre un bon développement racinaire. N'oubliez pas de percer plusieurs trous de drainage au fond du pot et d'ajouter une couche de graviers ou de billes d'argile de 3-4 cm.</article></span>
<span id='paragraphe-3'><h4>Techniques d'arrosage et de fertilisation pour maximiser la production</h4><article>L'arrosage des tomates cerises en pot demande une attention particulière car le substrat sèche plus vite qu'en pleine terre. Arrosez régulièrement mais sans excès, en maintenant le sol légèrement humide sans jamais le détremper. <u>Un paillis organique autour du pied permet de conserver l'humidité et de réduire la fréquence d'arrosage</u>. Côté fertilisation, apportez un engrais riche en potassium toutes les deux semaines dès l'apparition des premières fleurs pour favoriser la fructification.</article></span>
<span id='paragraphe-4'><h4>Taille et entretien pour optimiser la récolte</h4><article>La taille des tomates cerises en pot est simplifiée mais reste importante. Supprimez régulièrement les gourmands (pousses qui se développent à l'aisselle des feuilles) pour concentrer l'énergie de la plante sur la production de fruits. <em>Pincez également les feuilles du bas qui touchent le sol pour éviter les maladies cryptogamiques</em>. Un tuteurage solide est indispensable : utilisez un tuteur de 1,50 m minimum ou installez un treillis contre le mur de votre balcon.</article></span>
<span id='paragraphe-5'><h4>Prévenir et traiter les maladies courantes en culture urbaine</h4><article>Les tomates en pot sur balcon sont particulièrement sensibles au mildiou et à l'oïdium à cause de l'humidité stagnante. Prévenez ces problèmes en espaçant suffisamment vos plants et en évitant d'arroser le feuillage. <b>Une pulvérisation préventive de purin d'ortie dilué à 10% une fois par semaine renforce les défenses naturelles</b>. Si des taches apparaissent sur les feuilles, retirez-les immédiatement et traitez avec une solution de bicarbonate de soude (1 cuillère à soupe par litre d'eau).</article></span>`,
        citation: "Le jardinage, c'est l'art de cultiver la patience autant que les plantes. - Proverbe jardinier",
        lien_url_article: { lien1: "https://www.jardin-iris.be/blog/tomates-cerises-balcon-culture-pot" },
        categorie: "potager",
        new_href: "culture-tomates-cerises-pot-balcon-guide"
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour setPost', { titre: dummyPost.titre });
      return from(Promise.resolve(dummyPost));
    }
    
    const prompt = this.getPromptsService.generateArticle(articleIdea);
    return this.wrapWithErrorHandling(
      () => from(this.openaiApiService.fetchData(prompt, false)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI');
          }
          return parseJsonSafe(extractJSONBlock(result));
        })
      ),
      'setPost',
      `Génération d'article avec OpenAI pour l'idée: ${articleIdea}`
    );
  }

  setImageUrl(phraseAccroche: string, postId: number): Observable<string | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la génération d\'image',
        details: 'Simulation d\'une erreur lors de la génération d\'image avec OpenAI DALL-E',
        hint: 'Vérifiez votre clé API OpenAI et les crédits DALL-E disponibles',
        code: 'TEST_ERROR_004',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour setImageUrl', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const dummyImageUrl = `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80`;
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour setImageUrl', { imageUrl: dummyImageUrl, postId });
      return from(Promise.resolve(dummyImageUrl));
    }
    
    return this.wrapWithErrorHandling(
      () => from((async () => {
        // 1️⃣ Générer l'image en base64
        const b64_json = await this.openaiApiService.imageGeneratorUrl(this.getPromptsService.getOpenAiPromptImageGenerator(phraseAccroche));
        // 2️⃣ Convertir le base64 en Blob
        if (b64_json) {
          // 3️⃣ Uploader le Blob dans Supabase Storage
          const imageUrl = await this.supabaseService.uploadBase64ToSupabase(postId, b64_json);
          if (!imageUrl) {
            throw new Error('Échec de l\'upload de l\'image vers Supabase');
          }
          // 4️⃣ Mettre à jour le post avec l'URL publique
          await this.supabaseService.updateImageUrlPostByIdForm(postId, imageUrl);
          return imageUrl;
        }
        throw new Error('Échec de la génération de l\'image par OpenAI');
      })()),
      'setImageUrl',
      `Génération et upload d'image pour le post ${postId} avec la phrase: ${phraseAccroche}`
    );
  }

  setVideo(phrase_accroche: string, postId: number): Observable<string | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = true;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la recherche vidéo',
        details: 'Simulation d\'une erreur lors de la recherche vidéo YouTube',
        hint: 'Vérifiez votre clé API YouTube et les quotas disponibles',
        code: 'TEST_ERROR_005',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour setVideo', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const dummyVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rick Roll classique pour le test
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour setVideo', { videoUrl: dummyVideoUrl, postId });
      return from(Promise.resolve(dummyVideoUrl));
    }
    
    const prompt = this.getPromptsService.generateKeyWordForSearchVideo(phrase_accroche);
    return this.wrapWithErrorHandling(
      () => from(this.openaiApiService.fetchData(prompt, true)).pipe(
        switchMap(result => {
          if (!result) return of('');
          try {
            const keywordData: { keywords: string } = JSON.parse(extractJSONBlock(result));
            const keywords = keywordData.keywords;
            if (!keywords) return of('');
            return this.googleSearchService.searchFrenchVideo(keywords).pipe(
              switchMap((videoUrls: VideoInfo[]) => {
                if (!videoUrls.length) return of('');
                const videoPrompt = this.getPromptsService.searchVideoFromYoutubeResult(phrase_accroche, videoUrls);
                return from(this.openaiApiService.fetchData(videoPrompt, true)).pipe(
                  switchMap(videoResult => {
                    const videoData: { video: string } = JSON.parse(extractJSONBlock(videoResult));
                    const videoUrl = videoData.video && videoData.video.length ? videoData.video : null;
                    return videoUrl ? of(videoUrl) : of('');
                  })
                );
              })
            );
          } catch (error) {
            this.loggingService.error('INFRASTRUCTURE', 'Erreur lors du parsing du keyword', error);
            return of('');
          }
        })
      ),
      'setVideo',
      `Recherche de vidéo YouTube pour la phrase: ${phrase_accroche}`
    );
  }

  setFaq(article: string): Observable<{ question: string; response: string }[] | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = true;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la génération FAQ',
        details: 'Simulation d\'une erreur lors de la génération de la FAQ avec OpenAI',
        hint: 'Vérifiez votre clé API OpenAI et les crédits disponibles',
        code: 'TEST_ERROR_006',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour setFaq', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const dummyFaq = [
        {
          question: "À quelle fréquence dois-je arroser mes tomates cerises en pot ?",
          response: "Arrosez vos tomates cerises en pot tous les 2-3 jours en été, en vérifiant que la terre reste légèrement humide mais jamais détrempée. La fréquence dépend de la température, du vent et de la taille du pot."
        },
        {
          question: "Puis-je cultiver des tomates cerises sur un balcon orienté nord ?",
          response: "Un balcon orienté nord n'est pas idéal car les tomates ont besoin de 6-8h de soleil par jour minimum. Privilégiez les balcons sud, sud-est ou sud-ouest. À défaut, choisissez des variétés très précoces et résistantes."
        },
        {
          question: "Quand récolter les tomates cerises pour qu'elles soient les plus savoureuses ?",
          response: "Récoltez les tomates cerises lorsqu'elles sont bien colorées et légèrement souples au toucher. Pour un goût optimal, cueillez-les le matin après la rosée, quand elles sont fraîches et gorgées de saveur."
        },
        {
          question: "Comment éviter que mes tomates cerises se fendent ?",
          response: "Les tomates se fendent à cause d'arrosages irréguliers. Maintenez une humidité constante avec un paillis, arrosez régulièrement sans excès, et évitez les gros apports d'eau après une période sèche."
        },
        {
          question: "Est-il nécessaire de tuteurer les tomates cerises en pot ?",
          response: "Oui, même les variétés naines ont besoin d'un tuteur car le poids des fruits peut faire plier les tiges. Utilisez un tuteur de 1,20-1,50m ou installez un treillis pour soutenir la croissance."
        }
      ];
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour setFaq', { count: dummyFaq.length });
      return from(Promise.resolve(dummyFaq));
    }
    
    const prompt = this.getPromptsService.getPromptFaq(article);
    return this.wrapWithErrorHandling(
      () => from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI');
          }
          const data: {question: string; response: string}[]  = JSON.parse(extractJSONBlock(result))
          // TODO: Utiliser postId pour sauvegarder la FAQ dans Supabase
          return data;
        })
      ),
      'setFaq',
      `Génération de FAQ pour un article de ${article.length} caractères`
    );
  }

  internalImage(article: string, postId: number): Observable<{ article: string; images: InternalImageData[] } | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = true;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Impossible d\'ajouter les images internes',
        details: 'Simulation d\'une erreur pour tester la gestion d\'erreur',
        hint: 'Vérifiez la connexion à l\'API Pexels',
        code: 'TEST_ERROR_INTERNAL_IMAGE',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour internalImage', mockError);
      return from(Promise.resolve(mockError));
    }

    if (shouldReturnMock) {
      // Mock data avec images simulées
      const mockImages: InternalImageData[] = [
        {
          chapitreId: 1,
          keyword: 'garden',
          imageUrl: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg',
          alt: 'Mock garden image',
          photographer: 'Mock Photographer',
          photographerUrl: '#'
        },
        {
          chapitreId: 2,
          keyword: 'plants',
          imageUrl: 'https://images.pexels.com/photos/1000446/pexels-photo-1000446.jpeg',
          alt: 'Mock plants image',
          photographer: 'Mock Photographer 2',
          photographerUrl: '#'
        }
      ];
      
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock images internes ajoutées', { 
        originalLength: article.length,
        imagesCount: mockImages.length
      });
      
      return from(Promise.resolve({ 
        article: article, 
        images: mockImages 
      }));
    }

    this.loggingService.info('INFRASTRUCTURE', '🔧 Début internalImage() - Version complète (sans sauvegarde Supabase)', { articleLength: article.length, postId });
    
    // Créer un tableau des IDs de chapitres à traiter
    const chapterIds = Array.from({ length: environment.globalNbChapter }, (_, i) => i + 1);
    const usedKeywords: string[] = [];
    let upgradedArticle = article;
    
    return this.wrapWithErrorHandling(
      () => from(chapterIds).pipe(
      concatMap((chapitreId: number) => {
        this.loggingService.info('INFRASTRUCTURE', `🔧 Traitement du chapitre ${chapitreId}/${environment.globalNbChapter}`);
        
        // 1️⃣ Extraire le contenu <h4> du paragraphe
        const paragraphRegex = new RegExp(`<span id=['"]paragraphe-${chapitreId}['"][^>]*>(.*?)</span>`, 's');
        const paragraphMatch = upgradedArticle.match(paragraphRegex);
        
        if (!paragraphMatch) {
          this.loggingService.warn('INFRASTRUCTURE', `Paragraphe ${chapitreId} non trouvé`, {
            searchPattern: `<span id=['"]paragraphe-${chapitreId}['"]`,
            articleStart: article.substring(0, 200) + '...'
          });
          return of(null);
        }
        
        const paragraphContent = paragraphMatch[1];
        const h4Regex = /<h4[^>]*>(.*?)<\/h4>/;
        const h4Match = paragraphContent.match(h4Regex);
        
        if (!h4Match) {
          this.loggingService.warn('INFRASTRUCTURE', `Aucun titre <h4> trouvé dans le paragraphe ${chapitreId}`);
          return of(null);
        }
        
        const h4Content = h4Match[1];
        this.loggingService.info('INFRASTRUCTURE', `📝 Titre extrait du chapitre ${chapitreId}: ${h4Content}`);
        
        // 2️⃣ Envoyer le contenu <h4> à l'IA pour extraire un mot-clé
        const keywordPrompt = this.getPromptsService.getPromptGenericSelectKeyWordsFromChapitresInArticle(h4Content, usedKeywords);
        
        return from(this.openaiApiService.fetchData(keywordPrompt, true)).pipe(
          switchMap(keywordResult => {
            if (!keywordResult) {
              this.loggingService.warn('INFRASTRUCTURE', `Aucun mot-clé généré pour le chapitre ${chapitreId}`);
              return of(null);
            }
            
            try {
              const keywordData: { keyWord: string; explanation: string } = JSON.parse(extractJSONBlock(keywordResult));
              const keyword = keywordData.keyWord;
              const explanation = keywordData.explanation;
              
              if (!keyword || usedKeywords.includes(keyword)) {
                this.loggingService.warn('INFRASTRUCTURE', `Mot-clé invalide ou déjà utilisé: ${keyword}`);
                return of(null);
              }
              
              usedKeywords.push(keyword);
              this.loggingService.info('INFRASTRUCTURE', `🔑 Mot-clé généré pour chapitre ${chapitreId}: ${keyword} (${explanation})`);
              
              // 3️⃣ Utiliser le mot-clé avec l'API Pexels pour récupérer 5 images
              return this.pexelsApiService.searchImages(keyword, 5).pipe(
                switchMap(images => {
                  if (!images.length) {
                    this.loggingService.warn('INFRASTRUCTURE', `Aucune image trouvée sur Pexels pour: ${keyword}`);
                    return of(null);
                  }
                  
                  this.loggingService.info('INFRASTRUCTURE', `🖼️ ${images.length} images trouvées sur Pexels pour: ${keyword}`);
                  
                  // 4️⃣ Envoyer les 5 images à l'IA Vision pour sélectionner la meilleure
                  const imageUrls = images.map(img => img.src.medium);
                  const visionPrompt = this.getPromptsService.getPromptGenericSelectBestImageForChapitresInArticleWithVision(paragraphContent, imageUrls);
                  
                  return from(this.openaiApiService.fetchDataImage(visionPrompt, imageUrls)).pipe(
                    switchMap(visionResult => {
                      if (!visionResult) {
                        this.loggingService.warn('INFRASTRUCTURE', `Aucune sélection d'image par l'IA Vision pour le chapitre ${chapitreId}`);
                        return of(null);
                      }
                      
                      try {
                        const imageSelection: { imageUrl: string } = JSON.parse(extractJSONBlock(visionResult));
                        const selectedImageUrl = imageSelection.imageUrl;
                        
                        if (!selectedImageUrl || !imageUrls.includes(selectedImageUrl)) {
                          this.loggingService.warn('INFRASTRUCTURE', `URL d'image sélectionnée invalide: ${selectedImageUrl}`);
                          return of(null);
                        }
                        
                        // Trouver l'image complète correspondante
                        const selectedImage = images.find(img => img.src.medium === selectedImageUrl);
                        if (!selectedImage) {
                          this.loggingService.warn('INFRASTRUCTURE', `Image correspondante non trouvée pour l'URL: ${selectedImageUrl}`);
                          return of(null);
                        }
                        
                        this.loggingService.info('INFRASTRUCTURE', `✅ Image sélectionnée pour chapitre ${chapitreId}: ${selectedImage.alt || keyword}`);
                        
                        // 5️⃣ Créer les données d'image et insérer dans l'article
                        const imageData: InternalImageData = {
                          chapitreId,
                          keyword,
                          imageUrl: selectedImage.src.large,
                          alt: selectedImage.alt || keyword,
                          photographer: selectedImage.photographer,
                          photographerUrl: selectedImage.photographer_url
                        };
                        
                        // 6️⃣ Insérer l'image dans le paragraphe après le titre <h4>
                        const imageHtml = `<div class="internal-image">
                          <img src="${selectedImage.src.large}" alt="${selectedImage.alt || keyword}" loading="lazy" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />
                        </div>`;
                        
                        // Insérer l'image après le titre <h4>
                        const updatedParagraphContent = paragraphContent.replace(
                          /(<h4[^>]*>.*?<\/h4>)/,
                          `$1${imageHtml}`
                        );
                        
                        // Mettre à jour l'article complet avec le nouveau contenu du paragraphe
                        upgradedArticle = upgradedArticle.replace(
                          paragraphRegex,
                          `<span id='paragraphe-${chapitreId}'>${updatedParagraphContent}</span>`
                        );
                        
                        this.loggingService.info('INFRASTRUCTURE', `📦 Image insérée dans l'article pour chapitre ${chapitreId}`, imageData);
                        return of(imageData);
                      } catch (error) {
                        this.loggingService.error('INFRASTRUCTURE', `Erreur parsing sélection image chapitre ${chapitreId}`, error);
                        return of(null);
                      }
                    })
                  );
                })
              );
            } catch (error) {
              this.loggingService.error('INFRASTRUCTURE', `Erreur parsing mot-clé chapitre ${chapitreId}`, error);
              return of(null);
            }
          })
        );
      }),
      // Collecter tous les résultats
      toArray(),
      map(results => {
        const validResults = results.filter(result => result !== null) as InternalImageData[];
        this.loggingService.info('INFRASTRUCTURE', `📨 InternalImage terminé: ${validResults.length}/${environment.globalNbChapter} chapitres traités avec succès`);
        
        // Retourner l'article modifié et les données des images
        return {
          article: upgradedArticle,
          images: validResults
        };
      })
    ),
    'internalImage',
    `Ajout d'images internes pour ${environment.globalNbChapter} chapitres dans l'article du post ${postId}`
    );
  }

  setInternalLink(article: string, postTitreAndId: { titre: string; id: number; new_href: string }[]): Observable<string | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de l\'ajout des liens internes',
        details: 'Simulation d\'une erreur lors de l\'ajout de liens internes avec OpenAI',
        hint: 'Vérifiez votre clé API OpenAI et les crédits disponibles',
        code: 'TEST_ERROR_007',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour setInternalLink', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const upgradedArticle = article.replace(
        /jardinage/gi, 
        '<a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/guide-jardinage-debutant.html" title="Guide complet du jardinage">jardinage<span class="myTooltiptext">Guide complet du jardinage</span></a>'
      ).replace(
        /compost/gi,
        '<a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/compostage-domestique-dechets-organiques.html" title="Tout savoir sur le compostage">compost<span class="myTooltiptext">Tout savoir sur le compostage</span></a>'
      );
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour setInternalLink', { originalLength: article.length, upgradedLength: upgradedArticle.length });
      return from(Promise.resolve(upgradedArticle));
    }
    
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début setInternalLink()', { articleLength: article.length, postsCount: postTitreAndId.length });
    
    const prompt = this.getPromptsService.addInternalLinkInArticle(article, postTitreAndId);
    return this.wrapWithErrorHandling(
      () => from(this.openaiApiService.fetchData(prompt, true)).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI pour les liens internes');
          }
          const raw = extractJSONBlock(result);
          try {
          
            const data: { upgraded: string; idToRemove?: string } = JSON.parse(raw);
            this.loggingService.info('INFRASTRUCTURE', '📨 Réponse setInternalLink', { hasUpgraded: !!data.upgraded, idToRemove: data.idToRemove });
            return data.upgraded;
          } catch (error) {
            this.loggingService.error('INFRASTRUCTURE', 'Erreur lors du parsing du résultat setInternalLink', error);
            console.error('JSON.parse failed:', error);
            console.error('--- snippet (start) ---\n', raw.slice(0, 1000));
            throw new Error('Erreur lors du parsing du résultat des liens internes');
          }
        })
      ),
      'setInternalLink',
      `Ajout de liens internes dans un article de ${article.length} caractères avec ${postTitreAndId.length} posts disponibles`
    );
  }

  vegetal(article: string): Observable<string | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de l\'ajout des noms botaniques',
        details: 'Simulation d\'une erreur lors de l\'enrichissement botanique avec OpenAI',
        hint: 'Vérifiez votre clé API OpenAI et les crédits disponibles',
        code: 'TEST_ERROR_008',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour vegetal', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const upgradedArticle = article
        .replace(/tomates cerises/gi, 'tomates cerises (<em>Solanum lycopersicum</em> var. cerasiforme)')
        .replace(/basilic/gi, 'basilic (<em>Ocimum basilicum</em>)')
        .replace(/persil/gi, 'persil (<em>Petroselinum crispum</em>)')
        .replace(/thym/gi, 'thym (<em>Thymus vulgaris</em>)')
        .replace(/romarin/gi, 'romarin (<em>Rosmarinus officinalis</em>)')
        .replace(/lavande/gi, 'lavande (<em>Lavandula angustifolia</em>)')
        .replace(/roses/gi, 'roses (<em>Rosa</em> spp.)')
        .replace(/géraniums/gi, 'géraniums (<em>Pelargonium</em> spp.)')
        .replace(/pétunias/gi, 'pétunias (<em>Petunia</em> spp.)')
        .replace(/sauge/gi, 'sauge (<em>Salvia officinalis</em>)');
      
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour vegetal', { 
        originalLength: article.length, 
        upgradedLength: upgradedArticle.length,
        botanicalNamesAdded: (upgradedArticle.match(/<em>[^<]+<\/em>/g) || []).length
      });
      return from(Promise.resolve(upgradedArticle));
    }
    
    this.loggingService.info('INFRASTRUCTURE', '🔧 Début vegetal()', { articleLength: article.length });
    
    // Extraire les paragraphes de l'article pour traiter chacun séparément
    const paragraphMatches = article.match(/<span id="paragraphe-(\d+)">/g);
    if (!paragraphMatches) {
      this.loggingService.warn('INFRASTRUCTURE', 'Aucun paragraphe trouvé dans l\'article');
      return of(article);
    }

    // Traiter chaque paragraphe séquentiellement
    let upgradedArticle = article;
    const paragraphIds = paragraphMatches.map(match => {
      const idMatch = match.match(/paragraphe-(\d+)/);
      return idMatch ? parseInt(idMatch[1]) : 0;
    });

    return this.wrapWithErrorHandling(
      () => from(paragraphIds).pipe(
      concatMap((paragrapheId: number) => {
        // Extraire le contenu du paragraphe spécifique
        const paragraphRegex = new RegExp(`<span id="paragraphe-${paragrapheId}">(.*?)</span>`, 's');
        const paragraphMatch = upgradedArticle.match(paragraphRegex);
        
        if (!paragraphMatch) {
          this.loggingService.warn('INFRASTRUCTURE', `Paragraphe ${paragrapheId} non trouvé`);
          return of(upgradedArticle);
        }

        const paragraphContent = paragraphMatch[1];
        const prompt = this.getPromptsService.getPromptAddVegetalInArticle(paragraphContent, paragrapheId);
        
        return from(this.openaiApiService.fetchData(prompt, true)).pipe(
          map(result => {
            if (result === null) {
              this.loggingService.warn('INFRASTRUCTURE', `Aucun résultat pour le paragraphe ${paragrapheId}`);
              return upgradedArticle;
            }
            
            try {
              const data: { upgraded: string } = JSON.parse(extractJSONBlock(result));
              if (data.upgraded) {
                // Remplacer le contenu du paragraphe dans l'article complet
                upgradedArticle = upgradedArticle.replace(
                  paragraphRegex,
                  `<span id="paragraphe-${paragrapheId}">${data.upgraded}</span>`
                );
                this.loggingService.info('INFRASTRUCTURE', `Paragraphe ${paragrapheId} traité avec succès`);
              }
              return upgradedArticle;
            } catch (error) {
              this.loggingService.error('INFRASTRUCTURE', `Erreur parsing paragraphe ${paragrapheId}`, error);
              return upgradedArticle;
            }
          })
        );
      }),
      // Retourner le dernier état de l'article après traitement de tous les paragraphes
      map(() => upgradedArticle),
      tap((finalArticle: string) => {
        this.loggingService.info('INFRASTRUCTURE', '📨 Réponse vegetal complète', { 
          originalLength: article.length, 
          finalLength: finalArticle.length 
        });
      })
    ),
    'vegetal',
    `Ajout de noms botaniques dans un article de ${article.length} caractères`
    );
  }

  
}
