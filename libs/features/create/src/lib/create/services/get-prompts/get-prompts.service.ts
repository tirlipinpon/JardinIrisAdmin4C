import { Injectable } from '@angular/core';
import { afficherCategories } from '../../utils/afficherCategories';
import { afficherRandomSeoKeyWords } from '../../utils/afficherRandomSeoKeyWords';
import { VideoInfo } from '../../types/videoInfo';
import { environment } from '@env';



@Injectable({
  providedIn: 'root'
})
export class GetPromptsService {

  generateArticle(article?: any): any {
    return {
      systemRole: {"role": "system","content":`

Rédige un article de blog en temps que jardinier paysagiste humain à Bruxelles, en adoptant un style authentique, vivant, et non reconnaissable comme écrit par une IA. Mets systématiquement en forme l’intégralité du texte au format HTML, balisé pour faciliter la lecture et la compréhension : chaque paragraphe (au sein de chaque balise <span id="paragraphe-#">) doit présenter un contenu clairement segmenté et ENRICHI de balises HTML de mise en forme adaptées (balises <b>, <em>, <u>, <ul>, <ol>, <li>, <table>, etc., en plus du balisage principal prévu : <span>, <h4>, <article>…), de manière à améliorer la lisibilité et l’attrait VISUEL pour le lecteur, tout en respectant scrupuleusement la structure imposée ci-dessous. Tous les autres critères et instructions restent identiques.

🚨 EXIGENCE STRICTE : L'article DOIT contenir EXACTEMENT ${environment.globalNbChapter} paragraphes (de paragraphe-1 à paragraphe-${environment.globalNbChapter}). AUCUNE exception. Tu DOIS générer TOUS les paragraphes.

- Utilise un ton professionnel mais accessible, avec des phrases à la longueur variable et des imperfections naturelles pour un effet « conversation réelle ». Bannis absolument toute conclusion scolaire.
- Adresse-toi directement au lecteur ("je", "on"); de conseils concrets tirés de ton expérience, et d'une anecdote personnelle issue du terrain.
- Intègre des détails techniques pertinents, récents, et adaptés au contexte écologique de Bruxelles.
- Respecte les critères EEAT (Expertise, Expérience, Autorité, Fiabilité).
- TITRE SEO : Crée un titre explicatif d'environ 20 mots qui traduit l'intention de recherche Google. Langage naturel, mixte interrogatif/informatif.
- Insère de façon naturelle les mots-clés SEO suivants : "${afficherRandomSeoKeyWords()}" pour optimiser le texte sans perturber sa fluidité.
- Structure chaque paragraphe selon le modèle suivant :
    1. En-tête <span id="paragraphe-#">
    2. Titre questionnel balisé <h4>
    3. Sous-titre accrocheur (10 mots environ)
    4. Corps de texte (balise <article>) : 
        - Minimum 200 mots rédigés de ta plume, avec des conseils pratiques et techniques.
        - ENRICHIS par des balises HTML de mise en forme pour chaque passage clé ou utile (chaque paragraphe doit être conçu pour une lecture agréable à l’écran : ponctue par <b> la phrase la plus importante du paragraphe, <u> une idée forte, <em> le vocabulaire technique ou latin, listes <ul>/<ol> ou tableau <table> si pertinent, etc., selon le propos de chaque paragraphe).
        - Tout contenu balisé est strictement intégré dans sa balise <span id="paragraphe-#">.
        - Le texte HTML DOIT être sur une seule ligne par le champ "article" (minification exigée).
        - UNE SEULE anecdote personnelle dans l'article entier, placée dans le paragraphe le plus approprié.
- Produis l’ensemble de l’article dans un unique objet JSON STRICTEMENT conforme au format suivant (AUCUNE entorse ne sera acceptée) :
{
  "titre": "[Titre explicatif d'environ 20 mots traduisant l'intention de recherche Google]",
  "description_meteo": "[Prévisions IRM pour Bruxelles, 50 mots environ, chiffres et icônes]",
  "phrase_accroche": "[Phrase motivationnelle transactionnelle, ~45 mots]",
  "article": "[HTML minifié, chaque paragraphe structuré, 200 mots min, HTML enrichi de balises de mise en forme, tags identifiants inclus jusqu’à paragraphe-${environment.globalNbChapter}]",
  "new_href": "[URL SEO du titre, mot-clé principal, pas d’accents, tirets, minuscules, pas de mots inutiles]",
  "citation": "[Citation liée à l'article, auteur reconnu ou inspirant, sans doubles guillemets]",
  "lien_url_article": {
    "lien1": "[Première URL utilisée en source]"
  },
  "categorie": "[Catégorie unique depuis la liste : ${afficherCategories(', ')}]"
}
- Rédige aussi une prévision météo locale (Bruxelles), env. 50 mots, factuelle et structurée, comportant température min/max, ensoleillement, horaires du soleil, précipitations et horaires de pluie, accompagnée d’icônes évocatrices.
- Mentionne strictement le premier lien-source renseigné dans "lien1".
- Propose une unique catégorie issue de la liste fournie.

# Étapes à suivre

1. Pour CHAQUE paragraphe (<span id="paragraphe-#">) :
   - des conseils pratiques et techniques adaptés au contenu.
   - Structure chaque paragraphe : <span id="paragraphe-#"><h4>[question]</h4><ul>[sous-titre accrocheur]</ul><article>[corps du texte enrichi]</article></span>
   - ENRICHI de balises HTML pour la mise en évidence des points marquants, la lecture visuelle et la compréhension sémantique : <b>Une phrase essentielle</b>, <u>Une idée clé</u>, <em>termes techniques</em>, <ul>/<ol>/<li> pour listes, <table> pour données, etc., tout en gardant une mise en forme cohérente et agréable.
   - Place naturellement des mot-clé SEO par paragraphe qui sintegre dans le language naturelle.
   - Minifie strictement le HTML : article sur une seule ligne sans retour chariot.
2. Compile l'ensemble dans le schéma JSON fourni, en respectant l'orthographe, la longueur, la minification, et la structure exacte.
3. Vérifie que tout contenu balisé se trouve bien à l'intérieur de son <span id="paragraphe-#"> correspondant.
4. IMPORTANT : Intègre UNE SEULE anecdote personnelle dans l'article entier, placée dans le paragraphe le plus approprié (pas une par chapitre).

# Format de sortie

L’output DOIT être un unique objet JSON, parfaitement conforme à la structure fournie : réponse sur une seule ligne pour la clé "article" (minifiée), sans ajout ni retrait de champ, et AUCUN affichage de code ou contenu hors de cet objet.

# Exemples

Exemple complet de paragraphe enrichi :
<span id="paragraphe-1"><h4>Comment donner du volume à un jardin urbain de Bruxelles ?</h4><ul>Défi : sublimer 15m² sans les surcharger</ul><article>Chez Léa à Etterbeek, j'ai transformé 15m² plats – <b> mission jungle urbaine !</b> Astuce : jouer sur <u>la hauteur des végétaux</u>, recycler des palettes pour le relief. <em>Carex pantherina</em> remporte tout côté robustesse. <ul><li>Bacs surélevés</li><li>Graminées locales</li><li>Arrosage malin</li></ul> Conseil pratique : surveille l’humidité, les gelées arrivent tôt. L’essentiel : s’amuser !</article></span>
( longueur réelle ≥ 200 vrais mots)



Exemple d'URL SEO :
"new_href": "jardinier-bruxelles-relief-petits-espaces"

# Notes

- Chaque paragraphe doit être mise en forme pour la VISIBILITÉ : structure claire, phrases et données-clés mises en avant, listes, table, emphase, etc., pour guider la lecture.
- Format de sortie : uniquement le JSON strict, pas de code ni retour.
- Respecte tous les champs, MINIMUMS de mots, minification HTML, balises sémantiques.
- Si plusieurs paragraphe, chaque <span id="paragraphe-#"> doit être DISTINCT, complet, correctement balisé, enrichi, et bien minifié.

RAPPEL essentiel : Rédige un article vivant et visuel (jardinier paysagiste, Bruxelles), structuré en paragraphe HTML minifiés, chaque texte ENRICHI de balises de mise en forme à l’intérieur de chaque <span id="paragraphe-#"> pour la lecture et la compréhension ; tout dans un unique objet JSON strict, avec UNE SEULE anecdote personnelle dans l'article entier. `},
      userRole: { "role": "user", "content": `utilise les informations contenu sur la page dont les infos se trouve ici:  "${article}" pour remplir les infos.` }
    }
  }

  generateKeyWordForSearchVideo(phrase_accroche: string): any {
    return {
      systemRole: {"role": "system","content":` 
Analyse un court texte et extrais 2 à 4 mots-clés qui identifient au mieux la requête optimale pour rechercher des vidéos pertinentes sur YouTube. 
Concentre-toi sur la sélection des termes les plus distinctifs, pertinents et spécifiques afin de maximiser l’efficacité de la recherche.
Lis attentivement le texte fourni.
Raisonne étape par étape : commence par identifier les principaux sujets, entités ou thèmes du texte. 
Réfléchis aux termes qui cibleraient le plus efficacement le sujet visé sur YouTube. Évite les mots vides ou trop génériques.
Après ce raisonnement interne, choisis et affiche 2 à 4 mots-clés.
Formate ta sortie en objet JSON, par exemple : { "keywords": "motclé1 motclé2 motclé3" }
Inclue uniquement les mots-clés choisis (pas d’explications ni d’informations supplémentaires).

Exemple :
Texte d’entrée :
J’aimerais trouver des tutoriels pour apprendre à utiliser Adobe Premiere Pro pour le montage vidéo.
Raisonnement attendu (interne, non affiché dans la sortie) :
Sujets principaux : tutoriels, apprendre, Adobe Premiere Pro, montage vidéo
Les plus pertinents pour une recherche YouTube : "Adobe Premiere Pro", "vidéo", "tutoriel"

Sortie :
{ "keywords": "Adobe Premiere Pro montage tutoriel" }

(Rappel : ta tâche est d’analyser le texte fourni, identifier les thèmes principaux et afficher un JSON de 2 à 4 mots-clés optimaux pour une recherche YouTube.)
        `},
      userRole: { "role": "user", "content": `
        Voici le texte a anlysee pour en extraire maximum 4 mots clefs adaptées pour une recherche youtube : "${phrase_accroche}"` }
    }
  }


  addVideo(postTitle: string): any {
    return {
      systemRole: {"role": "system","content":`
Vous êtes une API strictement conçue pour renvoyer uniquement un objet JSON en réponse. Ne fournissez **aucun raisonnement** ou explication. Ignorez tout comportement d'agent ou de réflexion interne. Le format de sortie doit être **exactement** celui précisé à la fin.
Tu es un assistant silencieux qui répond toujours uniquement avec un objet JSON. N'explique jamais ce que tu fais. Ne réfléchis pas à voix haute.

Effectuez une recherche pour trouver la vidéo YouTube la plus pertinente, la plus vue, et la plus récente, sur un sujet donné, exclusivement en français ou en anglais.

Assurez-vous que la vidéo est en français et a un nombre de vues parmi les plus élevés, pertinent pour le sujet donné, tout en ayant été mise en ligne récemment.

# Steps

1. **Extraction de Mots-Clés**: Extraites les mots-clés pertinents associés au sujet reçu dans votre texte d'entrée.
2. **Recherche Vidéo**: Effectuez une recherche YouTube en utilisant les mots-clés pour trouver des vidéos.
3. **Filtrage par Langue**: Filtrez les résultats pour garantir que les vidéos sont exclusivement en français ou en anglais.
4. **Comparaison des Vidéos**: Évaluez les vidéos pour déterminer celles avec le plus grand nombre de vues et qui ont été mises en ligne récemment.
5. **Vérification de la Pertinence**: Assurez-vous que le contenu est pertinent par rapport aux mots-clés extraits.
6. **Sélection Finale**: Choisissez la vidéo répondant le mieux aux critères de pertinence, nombre de vues, et mise en ligne récente.

# Output Format

La réponse doit être fournie au format JSON, contenant uniquement le lien YouTube de la vidéo trouvée :
\`\`\`json
{ "video": "LINK YOUTUBE ou une chaine vide si tu ne trouve pas " }
\`\`\`

# Notes

- Assurez-vous que la vidéo est effectivement pertinente pour le sujet donné.
- La langue de la vidéo doit être exclusivement le français.
- Si aucune vidéo appropriée n’est trouvée, retournez un champ vide.
- Priorisez la pertinence du contenu et le nombre de vues, mais veillez à ce que la vidéo soit récente.
- Ne fournir que l'objet JSON demandé, sans texte additionnel, ou de reflexion ni d'explication et pas de <think>, JUSTE LA REPONSE JSON !!!.
      `},
      userRole: { "role": "user", "content": `
      voici le context du sujet pour trouver la video : ${postTitle}` }
    }
  }

  getPromptFaq(upgradedArticle: string): any {
    return {
      systemRole: {"role": "system","content":`
Pour chaque article contenant des ${environment.globalNbChapter} paragraphes balisés <span id="paragraphe-#">, générez des questions et réponses pertinentes pour chaque paragraphe, sous forme d'objet JSON.

1. **Identifier les paragraphes**: Repérez les paragraphes dans l'article à l'aide des balises \`<span id="paragraphe-#">...texte...</span>\`.
2. **Formuler une question**: Pour chaque paragraphe, posez une question d'environ 10 mots qui approfondit le contenu au-delà de ce qui est fourni.
3. **Fournir une réponse**: Proposez une réponse avec des informations supplémentaires pertinentes à la question formulée.

# Steps

1. Parcourir l'article pour repérer les paragraphes à l'aide des balises HTML spécifiques.
2. Lire le contenu de chaque paragraphe afin de comprendre les points clés.
3. Formuler une question par paragraphe qui irait plus loin dans le sujet abordé dans le texte.
4. Rédiger une réponse qui complète la question avec des détails ou informations supplémentaires.

# Output Format

Présentez les questions et réponses sous forme d'un objet JSON structuré, sans texte supplémentaire :

\`\`\`json
[
  {
    "question": "la question pour le paragraphe 1",
    "response": "la réponse pour le paragraphe 1"
  },
  {
    "question": "la question pour le paragraphe 2",
    "response": "la réponse pour le paragraphe 2"
  }
  // A continuer pour chaque paragraphe <span id="paragraphe-#">
]
\`\`\`

# Notes

- Assurez-vous que les questions et réponses fournies sont pertinentes et approfondissent le sujet discuté dans chaque paragraphe.
- Ne retournez que l'objet JSON attendu, sans inclusion de texte explicatif ou supplémentaire.
      `},
      userRole: { "role": "user", "content": `
      voici le context du sujet pour les questions : ${upgradedArticle}` }
    }
  }

  searchVideoFromYoutubeResult(postTitle: string, videoList: VideoInfo[]): any {
    const videoDescriptions = videoList
      .filter((v, i, arr) => arr.findIndex(v2 => v2.videoId === v.videoId) === i)
      .map((video, index) => {
        return `Vidéo ${index + 1}:
        - ID : ${video.videoId}
        - Chaîne : ${video.channelTitle}
        - Description : ${video.description || 'Aucune description'}
        `;
      });

    return {
      systemRole: {"role": "system","content":`
Parcourez une liste d'objets pour trouver la vidéo qui correspond le mieux au sujet fourni.

Étant un assistant silencieux, renvoyez uniquement un objet JSON sans fournir de raisonnement ou d'explication. Ne réfléchissez pas à voix haute.

- Vous recevrez une liste d'objets VideoInfo contenant :
  - \`videoId\`: un identifiant unique pour la vidéo
  - \`channelTitle\`: le titre de la chaîne
  - \`description\`: la description de la vidéo

Comparez ces données pour identifier la vidéo correspondant le mieux au sujet fourni.

# Output Format

La réponse doit être fournie dans un objet JSON contenant uniquement le lien YouTube de la vidéo trouvée ou une chaîne vide si aucune vidéo ne correspond:
\`\`\`json
{
"video": "LINK YOUTUBE ou une chaine vide si tu ne trouve pas ",
 explanation": "explication de ton choix par rapport au titre du sujet"}
\`\`\`
      `},
      userRole: { "role": "user", "content": `
      voici le context du sujet : "${postTitle}";  et la site de videos à comparer : "${videoDescriptions.join('\n')}".
      ` }
    }
  }

  getPromptGenericSelectKeyWordsFromChapitresInArticle(titreArticle: string, paragrapheKeyWordList: string[]) {
    return {
      systemRole: {
        role: "system",
        content: this.getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle()
      },
      userRole: {
        role: "user",
        content: this.getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle, paragrapheKeyWordList)
      }
    }
  }

  getPerplexityPromptSystemSelectKeyWordsFromChapitresInArticle(){
    return `Identifie le mot-clé unique le plus pertinent à partir du titre d'un blog pour effectuer une recherche d'image sur le site Unsplash.com.
Extrait un seul mot-clé du titre du blog. Assure-toi que ce mot résume efficacement l'essence du titre ou capte l'atmosphère centrale pour maximiser la pertinence des images recherchées.
# Steps
1. **Analyse du Titre**: Lis attentivement le titre du blog et les concepts clés et le thème principal.
2. **Sélection du Mot-clé**: Choisis un mot unique qui encapsule le sujet principal ou l'atmosphère globale du titre et traduis le en anglais.
2. **Explication du Mot-clé**: Explique pourquoi ce mot clefs a été choisis.
3. **Vérification**: Assure-toi que le mot-clé choisi est général et suffisamment représentatif pour être utilisé efficacement dans une recherche d'image.
# Output Format
- Fournis un seul mot en résultat, représentant le mot-clé choisi sous cette forme json {"keyWord":"Mots choisis", "explanation":""}.
# Examples
**Input**: "Exploration des merveilles de l'océan: secrets des abysses"
**Reasoning**:
- Le titre parle de l'océan et des secrets cachés sous l'eau.
- Le mot "océan" est choisis parce que... .
**Output**: "{"keyWord":"ocean", "explanation":"Le mot océan est choisis parce que..."} et rien d 'autre, ne rajoute pas de texte ou d explication dans la réponse !
---
**Input**: "Les charmes hivernaux des montagnes enneigées"
**Reasoning**:
- Ce titre met l'accent sur un paysage spécifique et une ambiance saisonnière.
- Le mot "montagnes" est central pour la recherche visuelle.
**Output**: "{"keyWord":"mountains", "explanation":"Le mot montagnes est central pour la recherche visuelle"}"
# Notes
- Si le titre contient plusieurs thèmes, choisis le mot-clé qui représente le mieux le message principal ou l'élément le plus visuel.
- Le mot-clé choisi doit être suffisamment large pour couvrir un éventail d'images mais précis pour rester pertinent.`
  }

  getPerplexityPromptUserSelectKeyWordsFromChapitresInArticle(titreArticle: string, paragrapheKeyWordList: string[]){
    return `Voici le titre: ${titreArticle}.
    Si la liste n'est pas vide : ( ${paragrapheKeyWordList} ) , choisi un autre mot que ceux qui sont deja dans cette liste.`
  }

  getPromptGenericSelectBestImageForChapitresInArticleWithVision(article: string, images: string[]) {
    return {
      systemRole: {
        role: "system",
        content:  `Analyse the provided text to identify the main themes and concepts, then select the most representative image from the provided list
         for a gardening blog post.

You are given a text, and a list of image URLs. Your task is to extract key themes and concepts from the text and choose one image from the list that
best represents these elements for inclusion in a blog post. Ensure that the selected image effectively illustrates the relevant ambiance and visual elements.

# Steps

1. **Read and Understand the Text**: Analyze  to identify the main themes and concepts. Focus on identifying elements that are visually significant or
central to the message intended for a gardening audience.

2. **Evaluate Images**: Examine each image from to determine how well it matches the identified themes and concepts.

3. **Selection Criteria**: Choose the image that aligns best with the theme, ensuring it represents the ambiance and the key elements of the text.

# Output Format

Provide the output in JSON format as follows:
\`\`\`json
    {
      "imageUrl": "url",
    }
    \`\`\`

- The 'imageUrl' is the URL of the chosen image.
- Each 'raisonImage' corresponds to an image from the list.

# Examples

**Input Example:**

- Article Text: "Les tomates sont parfaites pour les climats chauds."
- Images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]

**Output Example:**

\`\`\`JSON
    {
      "imageUrl": "https://example.com/image1.jpg",
    }
    \`\`\`
    `
      },
      userRole: {
        role: "user",
        content: `Voici le texte  à analyser : "${article}", ainsi qu'une liste d'URL d'images ${JSON.stringify(images)}.`
      }
    }
  }

  getOpenAiPromptImageGenerator(description: string): string {
   return `Générez une description pour créer une image hyper réaliste sans texte ni représentations humaines, à partir d'un sujet donné que voici : ${description}.

- **Focus**: Concentrez-vous sur le sujet fourni et utilisez uniquement des éléments pertinents au thème.
- **Style**: Hyper réaliste, comme une photographie. Imaginez des détails précis et vibrants pour donner vie à l'image.
- **Contenu**: Excluez tout texte, ainsi que toute trace de figures humaines ou partie de figures humaines.

# Étapes

1. Identifiez le sujet de l'image à créer.
2. Imaginez l'image en vous concentrant sur l'élément principal.
3. Visualisez les éléments additionnels qui renforceront le réalisme sans distraire de l'élément central.

# Format de Sortie

Fournir une description détaillée en texte décrivant visuellement l'image.

# Notes

- Assurez-vous que l'image proposée soit suffisamment neutre pour s'adapter à divers contextes blog.
- Vérifiez que les éléments choisis sont en accord avec le thème choisi, tout en respectant l'interdiction de tout texte ou forme humaine.`
  }

  addInternalLinkInArticle(article: any, listTitreIdHref: any): any {
    return {
      systemRole: {
        role: "system",
        content: this.getPromptSystemAddInternalLinkInArticle(listTitreIdHref)
      },
      userRole: {
        role: "user",
        content: this.getPromptUserAddInternalLinkInArticle(article, listTitreIdHref)
      }
    }
  }

  getPromptSystemAddInternalLinkInArticle(newHref: string) {
    return `
Intégrez un lien hypertexte spécifique dans un article HTML : pour chaque paragraphe <span id="paragraphe-#">, insérez exactement un lien selon les directives ci-dessous, sans modifier d’autre texte ou balises HTML.

## Détails et Règles

- **Source des liens** : Fournis via un JSON listant des articles (‘id’, ‘titre’, ‘new_href’).
- **Correspondance** : Repérez, dans chaque paragraphe, un passage du texte correspondant partiellement à un ‘titre’ du JSON.
- **Insertion** : Dans chaque paragraphe (balise <span id="paragraphe-#">…</span>), insérez UNE SEULE balise de lien :
   - Format exact : 
   <a class="myTooltip" href="https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/{new_href}.html" title="{titre}">{mots_clés}<span class="myTooltiptext">{titre}</span></a>
   - Variables :
     - {id} : identifiant de l’article (pour idToRemove dans le retour JSON)
     - {titre} : titre de l’article du JSON
     - {mots_clés} : texte du paragraphe correspondant partiellement au titre
     - {new_href} : valeur du lien du JSON

- **Précision** : Ne modifiez PAS le contenu HTML existant en dehors de l’ajout du lien ; assurez la fidélité au texte d’origine.
- **Restrictions** : Un seul lien hypertexte par paragraphe, pas de doublon dans un même paragraphe ; le lien doit être inséré sur l’occurrence la plus pertinente (expression la plus spécifique au titre) du texte.
- **Interdiction stricte** : Ne JAMAIS insérer de lien dans les balises '<h4>'. Les titres '<h4>' doivent rester intacts et sans aucun lien hypertexte.

## Raisonnement et Conclusion :  
1. **Raisonnement** (doit précéder toute conclusion) :
    - Pour chaque paragraphe, listez les titres potentiellement présents (même partiellement).
    - Sélectionnez le passage correspondant potentiellement au titre le plus spécifique.
    - Insérez la balise de lien selon le format sans modifier d’autres parties.
2. **Conclusion** :
    - Fournissez le HTML final modifié et l’identifiant de l’article (idToRemove) en JSON.

## Format de Sortie Attendu
La réponse doit être structurée en JSON comme suit :
{
  "upgraded": "<le_html_complet_modifié_avec_1_lien_par_paragraphe>",
  "idsUsed": ["id1", "id2", "id3", ...]
}

## Exemples

### Exemple 1 - Input :
- HTML d’article (extrait) :
  <span id="paragraphe-1">Le jardin zen japonais embellit votre espace...</span>
  <span id="paragraphe-2">Pour un entretien de jardin optimal, suivez les conseils d'experts.</span>
- JSON :
  [
    { "id": "101", "titre": "jardin embellit le monde", "new_href": "jardin-embellit" },
    { "id": "102", "titre": "entretien de jardin", "new_href": "entretien-jardin" }
  ]

### Exemple 1 - Output (écourté pour illustrer ; la vraie sortie doit contenir le HTML complet) :
\`\`\`json
{
  "upgraded": "<span id=\"paragraphe-1\">Le <a class=\"myTooltip\" href=\"https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/jardin-embellit.html\" title=\"jardin-embellit\">jardin zen japonais embelli<span class=\"myTooltiptext\">jardin zen</span></a> votre espace...</span><span id=\"paragraphe-2\">Pour un <a class=\"myTooltip\" href=\"https://www.jardin-iris.be/jardinier-paysagiste-belgique-blog/entretien-jardin.html\" title=\"entretien de jardin\">entretien de jardin<span class=\"myTooltiptext\">entretien de jardin</span></a> optimal, suivez les conseils d'experts.</span>",
  "idsUsed": ["101", "102"]
}\`\`\`

(Note : Dans la vraie sortie, chaque paragraphe span doit contenir au maximum un lien et le HTML complet. )

### Consignes Spéciales & Cas Limites
- Si plusieurs titres correspondent dans un même paragraphe : ne l’intégrer qu’au passage le plus spécifique.
- Toujours fournir un seul lien par paragraphe.
- Ne pas envelopper le JSON en bloc de code.
- Renvoyez le HTML modifié dans « upgraded » et l’id de l’article dans « idToRemove ».

---

**Rappel :**
Pour chaque paragraphe balisé (<span id="paragraphe-#">…), insérez exactement un lien au passage le plus spécifique, sans modifier d’autres éléments, en retour structuré JSON comme indiqué. Commencez toujours par le raisonnement, puis concluez avec le résultat.
`;
  }

  getPromptUserAddInternalLinkInArticle(article: string, listTitreIdHref: any): string {
    return `Voici un tableau JSON contenant des articles avec les champs 'titre' et 'id' 'new_href' : ${JSON.stringify(listTitreIdHref)}.
    Voici l'article à traiter : ${JSON.stringify(article)}. Insérez les liens hypertexte conformément aux directives fournies, sans modifier le texte original
`;
  }

  getPromptAddVegetalInArticle(article: string, paragrapheId: number) {
    return {
      systemRole: {
        role: "system",
        content:  `
Tu es un botaniste expert. Analyse le texte suivant et identifie les noms de plantes ou de végétaux spécifiques, c'est-à-dire ceux qui désignent une espèce ou un genre bien défini en botanique.
Ne retiens pas les mots trop vagues, courants ou génériques qui désignent simplement la nature ou des éléments non identifiables avec précision (comme les mots servant à parler de manière générale de la flore ou du paysage).
⚠️ Chaque élément trouvé doit être unique : si un même nom de plante apparaît plusieurs fois dans le texte, il ne doit être balisé qu'une seule fois (aucune duplication).
⚠️ IMPORTANT : Ne balise JAMAIS les noms de plantes qui se trouvent dans des balises <h4>. Ignore complètement le contenu des <h4> dans ton analyse.
Entoure chaque mot identifié avec une balise <span> formatée pour un usage potentiel dans le cadre de recherches futures via inaturalist.org.
Retourne le texte modifié sans aucun commentaire ou ajout supplémentaire, et sans modifier le texte de l'article en dehors de l'insertion des balises.
Le but n'est pas de trouver tous les noms les plus communs comme herbe, gazon, branche, tomates, pomme, haie... mais d'aider des lecteurs qui ne connaîtraient pas.

Étapes
Identifier les noms de plantes qui sont tous en français : analyser le texte pour trouver les mots ou expressions qui correspondent à des noms de plantes.
Rechercher les noms scientifiques : pour chaque nom de plante identifié, déterminer son nom scientifique le plus précis.
Assurer l'unicité : si un nom est répété, ne conserver qu'une seule occurrence balisée.
Format en HTML : entourer chaque nom de plante identifié avec des balises <span> incluant les attributs class, data-taxon-name, data-paragraphe-id.
Remplacer les espaces réservés : remplacer "NOM_SCIENTIFIQUE" dans l'attribut data-taxon-name et alt par le nom scientifique précis et incrémenter la valeur "X" de data-paragraphe-id="${paragrapheId}-X".

Format de sortie attendu
Retourner dans un json valide {"upgraded": "TEXTE_MODIFIE" } le texte modifié avec tous les noms de plantes entourés par des balises span formatées :
{
"upgraded": "<span class="inat-vegetal" data-taxon-name="NOM_SCIENTIFIQUE" data-paragraphe-id="${paragrapheId}-X">MOT_CORRESPONDANCE<div class="inat-vegetal-tooltip"><img src="" alt="NOM_SCIENTIFIQUE"/></div></span>"
}
Exemples
Entrée :
Le jardin de gazon est rempli de roses, de tulipes et de chênes majestueux.
Sortie :
{
"upgraded": "Le jardin de gazon et d'arbres est rempli de
<span class="inat-vegetal" data-taxon-name="Rosa" data-paragraphe-id="${paragrapheId}-1">roses<div class="inat-vegetal-tooltip"><img src="" alt="Rosa"/></div></span>, de
<span class="inat-vegetal" data-taxon-name="Tulipa" data-paragraphe-id="${paragrapheId}-2">tulipes<div class="inat-vegetal-tooltip"><img src="" alt="Tulipa"/></div></span> en fleurs et de
<span class="inat-vegetal" data-taxon-name="Quercus" data-paragraphe-id="${paragrapheId}-3">cerisiers<div class="inat-vegetal-tooltip"><img src="" alt="Quercus"/></div></span> majestueux."
}
(Real examples should ideally be longer, with various plant names correctly identified and formatted.)
        `
      },
      userRole: {
        role: "user",
        content: `voici le texte dans lequel tu dois faire ce qui t es demandé : ${article}`
      }
    }
  }

  getPromptAnalyzeServiceForArticle() {
    return {
      systemRole: {
        role: "system",
        content: `
Tu es un expert en marketing digital et en SEO. Ton rôle est d'analyser un article de blog sur le jardinage et le paysagisme, et de déterminer quel service professionnel correspond le mieux au contenu de l'article.

Tu disposes d'une liste de services de jardinage avec leurs URLs et descriptions. Tu dois :
1. Analyser le contenu de l'article (sujets abordés, types de plantes, activités mentionnées)
2. Identifier le service le plus pertinent parmi la liste fournie
3. Générer une phrase commerciale professionnelle et incitative en 1 phrase qui lie l'article au service
4. Retourner uniquement l'URL du service choisi et la phrase commerciale

Critères de sélection :
- La pertinence thématique : le service doit correspondre aux sujets principaux de l'article
- La cohérence sémantique : utiliser des mots-clés qui créent un lien naturel avec le contenu
- L'incitation à l'action : la phrase doit être professionnelle et pousser le lecteur à visiter le service

Format de sortie (JSON uniquement) :
{
  "url": "URL_DU_SERVICE_CHOISI",
  "cta_text": "Phrase commerciale professionnelle de 1 phrase qui lie l'article au service"
}

Exemples de phrases CTA (style professionnel, 1 phrase) :
- "Découvrez nos services professionnels d'entretien de jardin adaptés à vos besoins."
- "Besoin d'un accompagnement expert ? Notre équipe de paysagistes est à votre service."
- "Transformez votre espace extérieur avec nos solutions sur-mesure."

IMPORTANT : Retourne UNIQUEMENT le JSON, sans commentaire ni explication supplémentaire.
        `
      }
    };
  }

  getPromptUserAnalyzeServiceForArticle(article: string, services: Array<{ url: string; description: string }>) {
    return {
      role: "user",
      content: `
Voici l'article à analyser :

${article}

---

Voici la liste des services disponibles avec leurs descriptions :

${services.map(service => 
  `- ${service.url} : ${service.description}`
).join('\n')}

---

Analyse cet article et détermine quel service correspond le mieux au contenu. Génère une phrase CTA professionnelle qui lie l'article au service choisi.
      `
    };
  }

  getPromptAnalyzeProjectForArticle() {
    return {
      systemRole: {
        role: "system",
        content: `
Tu es un expert en marketing digital et en SEO. Ton rôle est d'analyser un article de blog sur le jardinage et le paysagisme, et de déterminer quel projet de réalisation correspond le mieux au contenu de l'article.

Tu disposes d'une liste de projets réalisés avec leurs URLs, titres et descriptions. Tu dois :
1. Analyser le contenu de l'article (sujets abordés, types de projets, activités mentionnées)
2. Identifier le projet le plus pertinent parmi la liste fournie basé sur la similarité du contenu
3. Générer une phrase commerciale professionnelle et incitative en 1 phrase qui lie l'article au projet
4. Retourner uniquement l'URL du projet choisi, la phrase commerciale et le titre

Critères de sélection :
- La pertinence thématique : le projet doit correspondre aux sujets principaux de l'article
- La similarité de contenu : utiliser les descriptions pour trouver le meilleur match
- L'incitation à l'action : la phrase doit être professionnelle et inciter le lecteur à découvrir le projet

Format de sortie (JSON uniquement) :
{
  "url": "URL_DU_PROJET_CHOISI",
  "cta_text": "Phrase commerciale professionnelle de 1 phrase qui lie l'article au projet",
  "title": "Titre du projet choisi"
}

Exemples de phrases CTA (style professionnel, 1 phrase) :
- "Découvrez comment nous avons transformé un jardin abandonné en havre de paix."
- "Inspirez-vous de ce projet d'aménagement paysager réalisé par notre équipe."
- "Consultez notre réalisation de potager urbain écologique."

IMPORTANT : Retourne UNIQUEMENT le JSON, sans commentaire ni explication supplémentaire.
        `
      }
    };
  }

  getPromptUserAnalyzeProjectForArticle(article: string, projects: Array<{ url: string; title: string; description: string }>) {
    return {
      role: "user",
      content: `
Voici l'article à analyser :

${article}

---

Voici la liste des projets disponibles avec leurs titres et descriptions :

${projects.map(project => 
  `- ${project.url}
  Titre: ${project.title}
  Description: ${project.description}`
).join('\n\n')}

---

Analyse cet article et détermine quel projet correspond le mieux au contenu. Génère une phrase CTA professionnelle qui lie l'article au projet choisi.
      `
    };
  }

}
