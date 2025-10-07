import { Injectable } from '@angular/core';
import { Post } from '../../features/create/types/post';
import { InternalImageData } from '../../features/create/types/internalImageData';

/**
 * Service centralisé pour toutes les données mockées
 * Permet de gérer facilement le mode dev/test sans disperser les mocks partout
 * 
 * Utilisation :
 * ```typescript
 * if (environment.useMocks) {
 *   return of(this.mockService.getMockArticle());
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  /**
   * Mock d'un ID de post
   */
  getMockNextPostId(): number {
    return 666;
  }

  /**
   * Mock des derniers posts (titres et IDs)
   */
  getMockLastPostTitles(): { titre: string; id: number; new_href: string }[] {
    return [
      { 
        titre: 'Comment créer un jardin écologique en ville ?', 
        id: 665, 
        new_href: 'jardin-ecologique-ville-guide-complet' 
      },
      { 
        titre: 'Les meilleures plantes vivaces pour un jardin bruxellois', 
        id: 664, 
        new_href: 'plantes-vivaces-jardin-bruxelles-selection' 
      },
      { 
        titre: 'Cultiver des légumes bio sur balcon : guide pratique', 
        id: 663, 
        new_href: 'legumes-bio-balcon-culture-urbaine' 
      },
      { 
        titre: 'Arrosage intelligent : économiser l\'eau au jardin', 
        id: 662, 
        new_href: 'arrosage-intelligent-economie-eau-jardin' 
      },
      { 
        titre: 'Compostage domestique : transformer ses déchets en or noir', 
        id: 661, 
        new_href: 'compostage-domestique-dechets-organiques' 
      },
      { 
        titre: 'Lutter contre les limaces naturellement', 
        id: 660, 
        new_href: 'lutte-naturelle-limaces-escargots-jardin' 
      },
      { 
        titre: 'Créer une prairie fleurie pour la biodiversité', 
        id: 659, 
        new_href: 'prairie-fleurie-biodiversite-pollinisateurs' 
      },
      { 
        titre: 'Taille des rosiers : quand et comment procéder', 
        id: 658, 
        new_href: 'taille-rosiers-technique-periode-optimale' 
      },
      { 
        titre: 'Installer un système de récupération d\'eau de pluie', 
        id: 657, 
        new_href: 'recuperation-eau-pluie-installation-jardin' 
      },
      { 
        titre: 'Permaculture urbaine : principes et applications', 
        id: 656, 
        new_href: 'permaculture-urbaine-principes-pratiques' 
      }
    ];
  }

  /**
   * Mock d'un article complet généré
   */
  getMockArticle(): Post {
    return {
      titre: 'Comment cultiver des tomates cerises en pot sur son balcon',
      description_meteo: 'Aujourd\'hui, le ciel est partiellement nuageux avec des températures de 22°C, parfait pour jardiner en extérieur sans risque de coup de soleil et des accacias fleurissent.',
      phrase_accroche: 'Transformez votre balcon en mini-potager productif ! Découvrez tous les secrets pour réussir la culture des tomates cerises en pot et savourer vos propres légumes bio.',
      article: `<span id='paragraphe-1'><h4>Choisir la bonne variété de tomates cerises pour la culture en pot</h4><article>Pour réussir la culture de tomates cerises sur votre balcon, le choix de la variété est crucial. Je recommande particulièrement les variétés 'Sweet 100', 'Cherry Belle' ou 'Tumbling Tom' qui s'adaptent parfaitement à la culture en contenants. Ces variétés compactes produisent abondamment et résistent bien aux conditions parfois difficiles d'un balcon urbain. <em>La variété 'Sweet 100' peut produire jusqu'à 100 petites tomates par grappe</em>, tandis que 'Tumbling Tom' est idéale pour les jardinières suspendues grâce à son port retombant naturel.</article></span>
<span id='paragraphe-2'><h4>Préparer le substrat et choisir les contenants adaptés</h4><article>Un bon drainage est essentiel pour éviter le pourrissement des racines. Utilisez un mélange composé de 50% de terreau universel, 30% de compost bien décomposé et 20% de perlite ou de vermiculite pour améliorer le drainage. <b>Le contenant doit faire au minimum 40 cm de profondeur et 30 cm de diamètre</b> pour permettre un bon développement racinaire. N'oubliez pas de percer plusieurs trous de drainage au fond du pot et d'ajouter une couche de graviers ou de billes d'argile de 3-4 cm.</article></span>
<span id='paragraphe-3'><h4>Techniques d'arrosage et de fertilisation pour maximiser la production</h4><article>L'arrosage des tomates en pot demande une attention particulière car le substrat sèche plus vite qu'en pleine terre. Arrosez régulièrement mais sans excès, en maintenant le sol légèrement humide sans jamais le détremper. <u>Un paillis organique autour du pied permet de conserver l'humidité et de réduire la fréquence d'arrosage</u>. Côté fertilisation, apportez un engrais riche en potassium toutes les deux semaines dès l'apparition des premières fleurs pour favoriser la fructification.</article></span>
<span id='paragraphe-4'><h4>Taille et entretien pour optimiser la récolte</h4><article>La taille des tomates cerises en pot est simplifiée mais reste importante. Supprimez régulièrement les gourmands (pousses qui se développent à l'aisselle des feuilles) pour concentrer l'énergie de la plante sur la production de fruits. <em>Pincez également les feuilles du bas qui touchent le sol pour éviter les maladies cryptogamiques</em>. Un tuteurage solide est indispensable : utilisez un tuteur de 1,50 m minimum ou installez un treillis contre le mur de votre balcon.</article></span>
<span id='paragraphe-5'><h4>Prévenir et traiter les maladies courantes en culture urbaine</h4><article>Les tomates en pot sur balcon sont particulièrement sensibles au mildiou et à l'oïdium à cause de l'humidité stagnante. Prévenez ces problèmes en espaçant suffisamment vos plants et en évitant d'arroser le feuillage. <b>Une pulvérisation préventive de purin d'ortie dilué à 10% une fois par semaine renforce les défenses naturelles</b>. Si des taches apparaissent sur les feuilles, retirez-les immédiatement et traitez avec une solution de bicarbonate de soude (1 cuillère à soupe par litre d'eau).</article></span>`,
      citation: 'Le jardinage, c\'est l\'art de cultiver la patience autant que les plantes. - Proverbe jardinier',
      lien_url_article: { lien1: 'https://www.jardin-iris.be/blog/tomates-cerises-balcon-culture-pot' },
      categorie: 'potager',
      new_href: 'culture-tomates-cerises-pot-balcon-guide'
    };
  }

  /**
   * Mock d'une URL d'image générée
   */
  getMockImageUrl(postId: number): string {
    return `https://zmgfaiprgbawcernymqa.supabase.co/storage/v1/object/public/jardin-iris-images-post/${postId}.png`;
  }

  /**
   * Mock d'une URL de vidéo YouTube
   */
  getMockVideoUrl(): string {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }

  /**
   * Mock d'une FAQ générée
   */
  getMockFaq(): { question: string; response: string }[] {
    return [
      {
        question: 'À quelle fréquence dois-je arroser mes tomates cerises en pot ?',
        response: 'Arrosez vos tomates cerises en pot tous les 2-3 jours en été, en vérifiant que la terre reste légèrement humide mais jamais détrempée. La fréquence dépend de la température, du vent et de la taille du pot.'
      },
      {
        question: 'Puis-je cultiver des tomates cerises sur un balcon orienté nord ?',
        response: 'Un balcon orienté nord n\'est pas idéal car les tomates ont besoin de 6-8h de soleil par jour minimum. Privilégiez les balcons sud, sud-est ou sud-ouest. À défaut, choisissez des variétés très précoces et résistantes.'
      },
      {
        question: 'Quand récolter les tomates cerises pour qu\'elles soient les plus savoureuses ?',
        response: 'Récoltez les tomates cerises lorsqu\'elles sont bien colorées et légèrement souples au toucher. Pour un goût optimal, cueillez-les le matin après la rosée, quand elles sont fraîches et gorgées de saveur.'
      },
      {
        question: 'Comment éviter que mes tomates cerises se fendent ?',
        response: 'Les tomates se fendent à cause d\'arrosages irréguliers. Maintenez une humidité constante avec un paillis, arrosez régulièrement sans excès, et évitez les gros apports d\'eau après une période sèche.'
      },
      {
        question: 'Est-il nécessaire de tuteurer les tomates cerises en pot ?',
        response: 'Oui, même les variétés naines ont besoin d\'un tuteur car le poids des fruits peut faire plier les tiges. Utilisez un tuteur de 1,20-1,50m ou installez un treillis pour soutenir la croissance.'
      }
    ];
  }

  /**
   * Mock d'images internes pour l'article
   */
  getMockInternalImages(): InternalImageData[] {
    return [
      { 
        chapitre_id: 1, 
        chapitre_key_word: 'variétés tomates cerises', 
        url_Image: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg',
        explanation_word: 'Différentes variétés de tomates cerises' 
      },
      { 
        chapitre_id: 2, 
        chapitre_key_word: 'pot drainage', 
        url_Image: 'https://images.pexels.com/photos/1000446/pexels-photo-1000446.jpeg',
        explanation_word: 'Pot avec système de drainage' 
      },
      { 
        chapitre_id: 3, 
        chapitre_key_word: 'arrosage tomates', 
        url_Image: 'https://images.pexels.com/photos/1000447/pexels-photo-1000447.jpeg',
        explanation_word: 'Arrosage d\'un plant de tomates' 
      },
      { 
        chapitre_id: 4, 
        chapitre_key_word: 'taille gourmands', 
        url_Image: 'https://images.pexels.com/photos/1000448/pexels-photo-1000448.jpeg',
        explanation_word: 'Taille des gourmands' 
      },
      { 
        chapitre_id: 5, 
        chapitre_key_word: 'maladies tomates', 
        url_Image: 'https://images.pexels.com/photos/1000449/pexels-photo-1000449.jpeg',
        explanation_word: 'Prévention des maladies' 
      }
    ];
  }

  /**
   * Mock d'un article enrichi avec liens internes
   */
  getMockArticleWithInternalLinks(originalArticle: string): string {
    return originalArticle.replace(
      /jardinage/gi, 
      '<a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/guide-jardinage-debutant.html" title="Guide complet du jardinage">jardinage<span class="myTooltiptext">Guide complet du jardinage</span></a>'
    ).replace(
      /compost/gi,
      '<a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/compostage-domestique-dechets-organiques.html" title="Tout savoir sur le compostage">compost<span class="myTooltiptext">Tout savoir sur le compostage</span></a>'
    );
  }

  /**
   * Mock d'un article enrichi avec noms scientifiques
   */
  getMockArticleWithBotanicalNames(originalArticle: string): string {
    let counter = 1;
    return originalArticle.replace(
      /tomates cerises/gi, 
      `<span class="inat-vegetal" data-taxon-name="Solanum lycopersicum" data-paragraphe-id="mock-${counter++}">tomates cerises<div class="inat-vegetal-tooltip"><img src="https://inaturalist-open-data.s3.amazonaws.com/photos/560287697/large.jpg" alt="Solanum lycopersicum"/></div></span>`
    );
  }
}

