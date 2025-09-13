import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, catchError } from 'rxjs';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { LoggingService } from '../../../../shared/services/logging.service';
import { OpenaiApiService } from '../../services/openai-api/openai-api.service';
import { GoogleSearchService } from '../../services/google-search/google-search.service';
import { PexelsApiService } from '../../services/pexels-api/pexels-api.service';
import { parseJsonSafe, extractJSONBlock } from '../../utils/cleanJsonObject';
import { Post } from '../../types/post';
import { GetPromptsService } from '../../services/get-prompts/get-prompts.service';
import { environment } from '../../../../../environments/environment';
import { InternalImageData } from '../../types/internalImageData';
import { AddScientificNameService } from '../../services/add-scientific-name/add-scientific-name.service';
import { InternalImageService } from '../../services/internal-image/internal-image.service';
import { ImageUploadService } from '../../services/image-upload/image-upload.service';
import { VideoService } from '../../services/video/video.service';
import { VegetalService } from '../../services/vegetal/vegetal.service';


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
  private readonly addScientificNameService = inject(AddScientificNameService);
  // new dedicated services
  private readonly internalImageService = inject(InternalImageService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly videoService = inject(VideoService);
  private readonly vegetalService = inject(VegetalService);

  /**
   * Méthode de test pour vérifier que les erreurs remontent bien dans le store
   * À utiliser temporairement pour débugger
   */
  testError(): Observable<string | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🧪 Test d\'erreur déclenché');
    
    return this.wrapWithErrorHandling(
      () => from(Promise.reject(new Error('Erreur de test pour vérifier la remontée dans le store'))),
      'testError',
      'Test de la gestion d\'erreur'
    );
  }
  
  /**
   * Méthode de test pour simuler une erreur Supabase Storage
   */
  testSupabaseStorageError(): Observable<string | PostgrestError> {
    this.loggingService.info('INFRASTRUCTURE', '🧪 Test d\'erreur Supabase Storage');
    
    return from((async () => {
      // Simuler l'erreur Supabase Storage
      const supabaseError = {
        statusCode: '403',
        error: 'Unauthorized', 
        message: 'new row violates row-level security policy'
      };
      
      const warningMessage = `Erreur Supabase Storage (test): ${supabaseError.message} - Image par défaut utilisée`;
      this.signalWarning(warningMessage);
      
      // Retourner l'image de fallback comme dans le vrai code
      return 'https://via.placeholder.com/800x400/4caf50/white?text=Test+Erreur+Storage';
    })());
  }

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
   * Interface pour signaler des warnings au store
   */
  private warningCallback?: (message: string) => void;
  
  setWarningCallback(callback: (message: string) => void) {
    this.warningCallback = callback;
  }
  
  private signalWarning(message: string) {
    if (this.warningCallback) {
      this.warningCallback(message);
    }
  }

  /**
   * Wrapper générique pour les opérations asynchrones avec gestion d'erreur
   */
  private wrapWithErrorHandling<T>(operation: () => Observable<T>, methodName: string, context: string = ''): Observable<T | PostgrestError> {
    return operation().pipe(
      catchError(error => {
        const postgrestError = this.handleError(error, context, methodName);
        return of(postgrestError);
      })
    );
  }

  getNextPostId(): Observable<number | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
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
    const shouldReturnMock = false;
    
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
        description_meteo: "Aujourd'hui, le ciel est partiellement nuageux avec des températures de 22°C, parfait pour jardiner en extérieur sans risque de coup de soleil et des accacias fleurissent.",
        phrase_accroche: "Transformez votre balcon en mini-potager productif ! Découvrez tous les secrets pour réussir la culture des tomates cerises en pot et savourer vos propres légumes bio.",
        article: `<span id='paragraphe-1'><h4>Choisir la bonne variété de tomates cerises pour la culture en pot</h4><article>Pour réussir la culture de tomates cerises sur votre balcon, le choix de la variété est crucial. Je recommande particulièrement les variétés 'Sweet 100', 'Cherry Belle' ou 'Tumbling Tom' qui s'adaptent parfaitement à la culture en contenants. Ces variétés compactes produisent abondamment et résistent bien aux conditions parfois difficiles d'un balcon urbain. <em>La variété 'Sweet 100' peut produire jusqu'à 100 petites tomates par grappe</em>, tandis que 'Tumbling Tom' est idéale pour les jardinières suspendues grâce à son port retombant naturel.</article></span>
<span id='paragraphe-2'><h4>Préparer le substrat et choisir les contenants adaptés</h4><article>Un bon drainage est essentiel pour éviter le pourrissement des racines. Utilisez un mélange composé de 50% de terreau universel, 30% de compost bien décomposé et 20% de perlite ou de vermiculite pour améliorer le drainage. <b>Le contenant doit faire au minimum 40 cm de profondeur et 30 cm de diamètre</b> pour permettre un bon développement racinaire. N'oubliez pas de percer plusieurs trous de drainage au fond du pot et d'ajouter une couche de graviers ou de billes d'argile de 3-4 cm.</article></span>
<span id='paragraphe-3'><h4>Techniques d'arrosage et de fertilisation pour maximiser la production</h4><article>L'arrosage des roses en pot demande une attention particulière car le substrat sèche plus vite qu'en pleine terre. Arrosez régulièrement mais sans excès, en maintenant le sol légèrement humide sans jamais le détremper. <u>Un paillis organique autour du pied permet de conserver l'humidité et de réduire la fréquence d'arrosage</u>. Côté fertilisation, apportez un engrais riche en potassium toutes les deux semaines dès l'apparition des premières fleurs pour favoriser la fructification.</article></span>
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
      () => from(this.openaiApiService.fetchData(prompt, true, 'setPost')).pipe(
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
    const shouldReturnMock = true;
    const shouldMockImageGeneration = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la génération d\'image',
        details: 'Simulation d\'une erreur lors de la génération d\'image',
        hint: 'Vérifiez la clé API et le storage',
        code: 'TEST_ERROR_004',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Erreur simulée setImageUrl', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const dummyImageUrl = 'https://via.placeholder.com/800x400/4caf50/white?text=Image+Mock';
      this.loggingService.info('INFRASTRUCTURE', '📨 Mock imageUrl', { imageUrl: dummyImageUrl, postId });
      return from(Promise.resolve(dummyImageUrl));
    }
    
    return this.wrapWithErrorHandling(
      () => this.imageUploadService.generateAndUploadImage(phraseAccroche, postId, shouldMockImageGeneration),
      'setImageUrl',
      `Génération et upload d'image pour le post ${postId} avec la phrase: ${phraseAccroche}`
    );
  }

  setVideo(phrase_accroche: string, postId: number): Observable<string | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec recherche vidéo',
        details: 'Simulation d\'erreur YouTube/OpenAI',
        hint: 'Vérifiez clé/quotas',
        code: 'TEST_ERROR_005',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Erreur simulée setVideo', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      const dummy = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      this.loggingService.info('INFRASTRUCTURE', '📨 Mock vidéo', { dummy, postId });
      return from(Promise.resolve(dummy));
    }

    return this.wrapWithErrorHandling(
      () => this.videoService.findBestVideoUrl(phrase_accroche, false),
      'setVideo',
      `Recherche de vidéo YouTube pour la phrase: ${phrase_accroche}`
    );
  }

  setFaq(article: string): Observable<{ question: string; response: string }[] | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
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
      () => from(this.openaiApiService.fetchData(prompt, true, 'setFaq')).pipe(
        map(result => {
          if (result === null) {
            throw new Error('Aucun résultat retourné par l\'API OpenAI');
          }
          return JSON.parse(extractJSONBlock(result))
        })
      ),
      'setFaq',
      `Génération de FAQ pour un article de ${article.length} caractères`
    );
  }

  internalImage(article: string, postId: number): Observable<{ article: string; images: InternalImageData[] } | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: internalImage',
        details: 'Simulation d\'erreur Pexels/OpenAI',
        hint: 'Vérifiez API keys',
        code: 'TEST_ERROR_INTERNAL_IMAGE',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Erreur simulée internalImage', mockError);
      return from(Promise.resolve(mockError));
    }

    if (shouldReturnMock) {
      const mockImages: InternalImageData[] = [
        { chapitre_id: 1, chapitre_key_word: 'garden', url_Image: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg', explanation_word: 'Image de jardin' },
        { chapitre_id: 2, chapitre_key_word: 'plants', url_Image: 'https://images.pexels.com/photos/1000446/pexels-photo-1000446.jpeg', explanation_word: 'Image de plantes' }
      ];
      this.loggingService.info('INFRASTRUCTURE', '📨 Mock internalImage', { count: mockImages.length });
      return from(Promise.resolve({ article, images: mockImages }));
    }
    
    return this.wrapWithErrorHandling(
      () => this.internalImageService.generateInternalImages(article, postId, (msg) => this.signalWarning(msg)),
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
      () => from(this.openaiApiService.fetchData(prompt, true, 'setInternalLink')).pipe(
        map(result => {
          if (result === null) { throw new Error('Aucun résultat retourné par l\'API OpenAI pour les liens internes'); }
          const raw = extractJSONBlock(result);
          try {
            const data: { upgraded: string; idToRemove?: string } = JSON.parse(raw);
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
        message: 'Erreur de test: vegetal',
        details: 'Simulation d\'erreur OpenAI/iNaturalist',
        hint: 'Vérifiez les APIs',
        code: 'TEST_ERROR_008',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Erreur simulée vegetal', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      let counter = 1;
      const upgraded = article.replace(/tomates cerises/gi, `<span class="inat-vegetal" data-taxon-name="Solanum lycopersicum" data-paragraphe-id="mock-${counter++}">tomates cerises<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/560287697/large.jpg" alt="Solanum lycopersicum"/></div></span>`);
      this.loggingService.info('INFRASTRUCTURE', '📨 Mock vegetal');
      return from(Promise.resolve(upgraded));
    }

    return this.wrapWithErrorHandling(
      () => this.vegetalService.enrichArticleWithBotanicalNames(article, false),
    'vegetal',
      `Enrichissement botanique complet de l'article (${article.length} caractères)`
    );
  }

  savePostComplete(post: Post): Observable<boolean | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la sauvegarde du post',
        details: 'Simulation d\'une erreur lors de la sauvegarde du post complet',
        hint: 'Vérifiez la connexion à Supabase',
        code: 'TEST_ERROR_009',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour savePostComplete', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour savePostComplete', { postId: post.id });
      return from(Promise.resolve(true));
    }
    
    this.loggingService.info('INFRASTRUCTURE', '💾 Sauvegarde post complet', { postId: post.id });
    
    return this.wrapWithErrorHandling(
      () => from(this.supabaseService.updatePostComplete(post)).pipe(
        map(() => {
          this.loggingService.info('INFRASTRUCTURE', '✅ Post sauvegardé dans Supabase');
          return true;
        })
      ),
      'savePostComplete',
      `Sauvegarde du post ${post.id} dans Supabase`
    );
  }

  saveFaqItems(postId: number, faqItems: { question: string; response: string }[]): Observable<boolean | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la sauvegarde des FAQ',
        details: 'Simulation d\'une erreur lors de la sauvegarde des items FAQ',
        hint: 'Vérifiez la connexion à Supabase',
        code: 'TEST_ERROR_010',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour saveFaqItems', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour saveFaqItems', { postId, count: faqItems.length });
      return from(Promise.resolve(true));
    }
    
    this.loggingService.info('INFRASTRUCTURE', '💾 Sauvegarde FAQ', { postId, count: faqItems.length });
    
    return this.wrapWithErrorHandling(
      () => from(this.supabaseService.saveFaqForPost(postId, faqItems)).pipe(
        map(() => {
          this.loggingService.info('INFRASTRUCTURE', '✅ FAQ sauvegardée dans Supabase');
          return true;
        })
      ),
      'saveFaqItems',
      `Sauvegarde de ${faqItems.length} items FAQ pour le post ${postId}`
    );
  }

  saveInternalImages(postId: number, images: InternalImageData[]): Observable<boolean | PostgrestError> {
    const shouldReturnError = false;
    const shouldReturnMock = false;
    
    if (shouldReturnError) {
      const mockError: PostgrestError = {
        message: 'Erreur de test: Échec de la sauvegarde des images internes',
        details: 'Simulation d\'une erreur lors de la sauvegarde des images internes',
        hint: 'Vérifiez la connexion à Supabase',
        code: 'TEST_ERROR_011',
        name: 'PostgrestError'
      };
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Erreur simulée pour saveInternalImages', mockError);
      return from(Promise.resolve(mockError));
    }
    
    if (shouldReturnMock) {
      this.loggingService.info('INFRASTRUCTURE', '📨 Réponse: Mock data pour saveInternalImages', { postId, count: images.length });
      return from(Promise.resolve(true));
    }
    
    this.loggingService.info('INFRASTRUCTURE', '💾 Sauvegarde images internes', { postId, count: images.length });
    
    return this.wrapWithErrorHandling(
      () => from(Promise.all(
        images.map(image => 
          this.supabaseService.setNewUrlImagesChapitres(
            image.url_Image,
            image.chapitre_id,
            postId,
            image.chapitre_key_word,
            image.explanation_word
          )
        )
      )).pipe(
        map(() => {
          this.loggingService.info('INFRASTRUCTURE', '✅ Images internes sauvegardées dans Supabase');
          return true;
        })
      ),
      'saveInternalImages',
      `Sauvegarde de ${images.length} images internes pour le post ${postId}`
    );
  }
  
}
