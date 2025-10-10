import { Injectable } from '@angular/core';

interface CropDimensions {
  offsetX: number;
  offsetY: number;
  cropWidth: number;
  cropHeight: number;
}

@Injectable({ providedIn: 'root' })
export class ImageProcessingService {

  /**
   * Traite une image pour les chapitres
   * - Redimensionne à 700×250px avec center crop
   * - Convertit en WebP
   * - Compresse jusqu'à 60Ko max
   * 
   * @param imageData Image originale en Uint8Array
   * @returns Image traitée en Uint8Array (WebP)
   */
  async processImageForChapter(imageData: Uint8Array): Promise<Uint8Array> {
    console.log('🎨 Début traitement image chapitre', {
      tailleOriginale: imageData.length
    });

    try {
      // Étape 1 : Uint8Array → ImageBitmap
      const blob = new Blob([imageData]);
      const imageBitmap = await createImageBitmap(blob);

      console.log('📐 Dimensions originales:', {
        width: imageBitmap.width,
        height: imageBitmap.height
      });

      // Étape 2 : Calculer les dimensions du center crop
      const targetWidth = 700;
      const targetHeight = 250;
      const cropDimensions = this.calculateCenterCrop(
        imageBitmap.width,
        imageBitmap.height,
        targetWidth,
        targetHeight
      );

      console.log('✂️ Dimensions de crop:', cropDimensions);

      // Étape 3 : Créer canvas et redimensionner avec crop
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Impossible de créer le contexte 2D du canvas');
      }

      // Dessiner l'image croppée et redimensionnée
      context.drawImage(
        imageBitmap,
        cropDimensions.offsetX,
        cropDimensions.offsetY,
        cropDimensions.cropWidth,
        cropDimensions.cropHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Étape 4 : Compression itérative jusqu'à 60Ko max
      const maxSizeBytes = 60 * 1024; // 60Ko
      const compressedBlob = await this.compressToSize(canvas, maxSizeBytes);

      console.log('✅ Image traitée:', {
        format: 'WebP',
        dimensions: `${targetWidth}×${targetHeight}`,
        taille: `${(compressedBlob.size / 1024).toFixed(2)} Ko`
      });

      // Étape 5 : Blob → Uint8Array
      const arrayBuffer = await compressedBlob.arrayBuffer();
      return new Uint8Array(arrayBuffer);

    } catch (error) {
      console.error('❌ Erreur traitement image:', error);
      // Fallback : retourner l'image originale
      console.warn('⚠️ Utilisation de l\'image originale sans traitement');
      return imageData;
    }
  }

  /**
   * Calcule les dimensions du center crop
   * 
   * @param sourceWidth Largeur de l'image source
   * @param sourceHeight Hauteur de l'image source
   * @param targetWidth Largeur cible
   * @param targetHeight Hauteur cible
   * @returns Dimensions et offsets pour le crop
   */
  private calculateCenterCrop(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ): CropDimensions {
    const targetRatio = targetWidth / targetHeight;
    const sourceRatio = sourceWidth / sourceHeight;

    let cropWidth: number;
    let cropHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (sourceRatio > targetRatio) {
      // Image plus large que nécessaire → crop horizontal
      cropHeight = sourceHeight;
      cropWidth = sourceHeight * targetRatio;
      offsetX = (sourceWidth - cropWidth) / 2;
      offsetY = 0;
    } else {
      // Image plus haute que nécessaire → crop vertical
      cropWidth = sourceWidth;
      cropHeight = sourceWidth / targetRatio;
      offsetX = 0;
      offsetY = (sourceHeight - cropHeight) / 2;
    }

    return {
      offsetX: Math.round(offsetX),
      offsetY: Math.round(offsetY),
      cropWidth: Math.round(cropWidth),
      cropHeight: Math.round(cropHeight)
    };
  }

  /**
   * Compresse un canvas en WebP jusqu'à la taille cible
   * Utilise une compression itérative en réduisant la qualité
   * 
   * @param canvas Canvas à compresser
   * @param maxSizeBytes Taille maximale en bytes
   * @returns Blob WebP compressé
   */
  private async compressToSize(
    canvas: HTMLCanvasElement,
    maxSizeBytes: number
  ): Promise<Blob> {
    let quality = 0.9; // Qualité initiale
    const minQuality = 0.1;
    const qualityStep = 0.05;

    console.log('🗜️ Début compression WebP...');

    while (quality >= minQuality) {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error('Échec de la conversion en blob'));
            }
          },
          'image/webp',
          quality
        );
      });

      console.log(`📊 Test qualité ${(quality * 100).toFixed(0)}%: ${(blob.size / 1024).toFixed(2)} Ko`);

      if (blob.size <= maxSizeBytes) {
        console.log(`✅ Compression réussie à ${(quality * 100).toFixed(0)}%`);
        return blob;
      }

      quality -= qualityStep;
    }

    // Si impossible d'atteindre la taille cible, retourner le meilleur compromis
    const finalBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Échec de la conversion en blob'));
          }
        },
        'image/webp',
        minQuality
      );
    });

    console.warn(`⚠️ Impossible d'atteindre ${(maxSizeBytes / 1024).toFixed(0)} Ko. Taille finale: ${(finalBlob.size / 1024).toFixed(2)} Ko`);
    return finalBlob;
  }
}

