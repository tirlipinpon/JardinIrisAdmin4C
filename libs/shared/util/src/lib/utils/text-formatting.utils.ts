/**
 * Utilitaires pour le formatage et nettoyage de texte
 * Centralise les fonctions de transformation de texte pour les slugs, noms de fichiers, etc.
 */

/**
 * Formate une description en slug SEO
 * @param description Description brute de l'IA
 * @returns Slug SEO (minuscules, tirets, max 50 chars)
 */
export function formatToSeoSlug(description: string): string {
  return description
    .toLowerCase()
    .normalize('NFD') // Normaliser les accents
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-') // Remplacer multiples tirets par un seul
    .substring(0, 50) // Limiter à 50 caractères
    .replace(/-$/, ''); // Supprimer tiret final si présent
}

/**
 * Nettoie un nom de fichier pour qu'il soit compatible avec les systèmes de fichiers
 * @param filename Nom de fichier à nettoyer
 * @returns Nom de fichier nettoyé
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Supprimer caractères interdits
    .replace(/\s+/g, '_') // Remplacer espaces par underscores
    .replace(/_{2,}/g, '_') // Remplacer multiples underscores par un seul
    .trim();
}

/**
 * Génère un slug à partir d'un titre ou d'une phrase
 * @param text Texte à convertir en slug
 * @param maxLength Longueur maximale (défaut: 50)
 * @returns Slug formaté
 */
export function generateSlug(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, maxLength)
    .replace(/-$/, '');
}

/**
 * Formate un nom de fichier d'image avec préfixe et extension
 * @param prefix Préfixe (ex: postId, chapitreId)
 * @param description Description ou slug
 * @param extension Extension du fichier (défaut: 'webp')
 * @returns Nom de fichier formaté
 */
export function formatImageFilename(
  prefix: string | number, 
  description: string, 
  extension: string = 'webp'
): string {
  const cleanDescription = formatToSeoSlug(description);
  return `${prefix}_${cleanDescription}.${extension}`;
}

/**
 * Génère un nom de fichier temporaire avec timestamp
 * @param prefix Préfixe du fichier
 * @param extension Extension du fichier (défaut: 'webp')
 * @returns Nom de fichier temporaire
 */
export function generateTempFilename(prefix: string | number, extension: string = 'webp'): string {
  const timestamp = Date.now();
  return `temp_${prefix}_${timestamp}.${extension}`;
}

/**
 * Valide si un slug est valide pour l'URL
 * @param slug Slug à valider
 * @returns true si le slug est valide
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 50;
}
