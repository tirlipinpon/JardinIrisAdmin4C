import { Injectable } from '@angular/core';
import { afficherCategories } from '../../utils/afficherCategories';
import { afficherRandomSeoKeyWords } from '../../utils/afficherRandomSeoKeyWords';

@Injectable({
  providedIn: 'root'
})
export class GetPromptsService {

  generateArticle(article?: any): any {
    return {
      systemRole: {"role": "system","content":`

       Tu es chargé de réécrire un article détaillé pour un blog de jardinage situé à Bruxelles en utilisant
       les informations fournies et respectant les normes SEO pour ces mots clefs: "${afficherRandomSeoKeyWords()}" et integrand en SEO les critères EEAT,
       en préservant un maximum de détails techniques récentes et contextuelles tout en intégrant de nouveaux éléments pertinents avec exemples et conseils.
       Inclue une touche d'humour subtilement. Élabore un article structuré en HTML valide tenant compte des enjeux écologiques.
       Présente l'article sous forme de JSON en respectant la structure fournie.

# Instructions
- **Titre**: Crée un titre court et pertinent pour l'article qui succite la lecture par une question informationnelle.
- **Phrase accroche**: Rédige une phrase accrocheuse d'environ 45 mots pour encourager la lecture sous forme transactionnelle.
- **Article**: Écris l'article en HTML valide, minifié sur une seule ligne avec des caractères spéciaux échappés, suivant cette structure :
  - 6 paragraphes, chaque paragraphe avec :
    - **Texte du paragraphe** sous forme <span id="paragraphe-{n}">
    <h4>Ecris un titre du paragraphe par une question informationnelle </h4>
    <ul><li>Trouve un sous-titre du paragraphe accrocheur (environ 10 mots)</li></ul>
    <article>Rédige un texte du paragraphe avec minimum 200 mots et pas moins !</article>
    </span>
    - **Citation**: Trouve et inclue une citation célèbre qui se rapporte au sujet traité, (sans double guillemets dans le texte).
    - **Liens**: Mentionne le premier lien utilisé pour rédiger le post sous "lien1".
    - **Catégorie**: Choisis une catégorie adéquate parmi celles fournies par "${afficherCategories(', ')}", et exclisivement une seule de celle la.

  # Output Format
    Présente le résultat sous la forme d'un JSON valide structuré comme suit :
{
  "titre": "Titre court pertinent pour le post.",
  "phrase_accroche": "Phrase accrocheuse d'environ 45 mots.",
  "article": "
  <span id="paragraphe-1">
  <h4>Ecris un ttitre du paragraphe par une question informationnelle </h4>
  <ul><li>Trouve un sous-titre du paragraphe accrocheur (environ 10 mots)</li></ul>
  <article>Rédige un texte du paragraphe 1 avec minimum 200 mots et pas moins !</article>
  </span> (Continuer ainsi pour tous les paragraphes avec minimum 200 mots et pas moins par paragraphe !, minifié sur une seule ligne).",
  "citation": "Citation célèbre pertinente avec son auteur si connu.",
  "lien_url_article": {
    "lien1": "URL du premier lien utilisé."
  },
  "categorie": "Catégorie choisie parmi celles proposées."
}

  # Notes
    - Ne renvoie qu'un seul objet JSON sans autre texte ou structuration.
    - Assure l'articulation logique et l'alignement du contenu avec le thème pour le lecteur cible.
    - Utilise des balises HTML appropriées et garantis la validité du code généré.
      `},
      userRole: { "role": "user", "content": `utilise les informations contenu sur la page dont les infos se trouve ici:  "${article}" pour remplir les infos.` }
    }
  }


}
