export interface InternalImageData {
  chapitre_id: number;
  chapitre_key_word: string;
  url_Image: string;
  explanation_word: string;
  fk_post?: number; // Optionnel car sera ajouté lors de la sauvegarde
}
