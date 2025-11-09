/**
 * Utilitaire pour formater les slugs pour les attributs alt des images
 */

/**
 * Extrait le nom de fichier depuis une URL d'image
 * @param imageUrl URL de l'image (ex: "https://storage.com/123/123_chapitre_1_jardin-vertical-bruxelles.webp")
 * @returns Nom de fichier (ex: "123_chapitre_1_jardin-vertical-bruxelles.webp")
 */
export function extractFilenameFromUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || '';
    return filename;
  } catch {
    // Si ce n'est pas une URL valide, essayer de récupérer le dernier segment
    const segments = imageUrl.split('/');
    return segments[segments.length - 1] || '';
  }
}

/**
 * Extrait le slug SEO depuis un nom de fichier d'image interne
 * @param filename Nom de fichier (ex: "123_chapitre_1_jardin-vertical-bruxelles.webp")
 * @returns Slug SEO (ex: "jardin-vertical-bruxelles")
 */
export function extractSeoSlugFromFilename(filename: string): string {
  if (!filename) return '';
  
  // Pattern: {postId}_chapitre_{chapitreId}_{slug-seo}.webp
  const match = filename.match(/^\d+_chapitre_\d+_(.+)\.webp$/);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Si le pattern ne correspond pas, retourner le nom sans extension
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Formate un slug pour un attribut alt d'image
 * @param slug Slug SEO (ex: "jardin-vertical-bruxelles")
 * @returns Slug formaté pour alt (ex: "Jardin vertical Bruxelles")
 */
export function formatSlugForAlt(slug: string): string {
  if (!slug) return '';
  
  return slug
    .split('-') // Séparer par les tires
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliser chaque mot
    .join(' '); // Joindre avec des espaces
}

/**
 * Génère un attribut alt optimisé depuis une URL d'image interne
 * @param imageUrl URL de l'image interne
 * @param fallbackKeyword Mot-clé de fallback si l'extraction échoue
 * @returns Attribut alt formaté (ex: "Jardin vertical Bruxelles")
 */
export function generateAltFromImageUrl(imageUrl: string, fallbackKeyword: string = ''): string {
  if (!imageUrl) return fallbackKeyword;
  
  // Extraire le nom de fichier
  const filename = extractFilenameFromUrl(imageUrl);
  
  // Extraire le slug SEO
  const seoSlug = extractSeoSlugFromFilename(filename);
  
  // Si on a un slug SEO, le formater
  if (seoSlug) {
    return formatSlugForAlt(seoSlug);
  }
  
  // Sinon, utiliser le mot-clé de fallback
  return fallbackKeyword || 'Image';
}

/**
 * Vérifie si une URL d'image est une image interne (avec slug SEO)
 * @param imageUrl URL de l'image
 * @returns true si c'est une image interne avec slug SEO
 */
export function isInternalImageWithSeoSlug(imageUrl: string): boolean {
  if (!imageUrl) return false;
  
  const filename = extractFilenameFromUrl(imageUrl);
  return /^\d+_chapitre_\d+_.+\.webp$/.test(filename);
}
