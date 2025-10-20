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
      const blob = new Blob([imageData as BlobPart]);
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

  /**
   * Traite une image pour le post principal (image DALL-E)
   * - Redimensionne à 400×400px (l'image est déjà carrée)
   * - Convertit en WebP
   * - Compresse jusqu'à 200Ko max
   * 
   * @param imageData Image en base64 ou Uint8Array
   * @returns Image traitée en Uint8Array (WebP)
   */
  async processImageForMainPost(imageData: string | Uint8Array): Promise<Uint8Array> {
    console.log('🎨 [IMAGE_PROCESSING] ===== DÉBUT TRAITEMENT IMAGE PRINCIPALE =====');
    console.log('🎨 [IMAGE_PROCESSING] Type données entrée:', typeof imageData);

    try {
      // Étape 1 : Convertir vers Uint8Array si nécessaire
      let uint8ArrayData: Uint8Array;
      if (typeof imageData === 'string') {
        console.log('📝 [IMAGE_PROCESSING] Conversion base64 → Uint8Array');
        console.log('📝 [IMAGE_PROCESSING] Longueur base64:', imageData.length);
        uint8ArrayData = this.convertBase64ToUint8Array(imageData);
        console.log('📝 [IMAGE_PROCESSING] Conversion OK, taille:', uint8ArrayData.length, 'bytes');
      } else {
        console.log('📝 [IMAGE_PROCESSING] Déjà Uint8Array, taille:', imageData.length, 'bytes');
        uint8ArrayData = imageData;
      }

      console.log('📐 [IMAGE_PROCESSING] Taille originale:', `${(uint8ArrayData.length / 1024).toFixed(2)} Ko`);

      // Étape 2 : Uint8Array → ImageBitmap
      console.log('🖼️ [IMAGE_PROCESSING] Création ImageBitmap...');
      const blob = new Blob([uint8ArrayData as BlobPart]);
      const imageBitmap = await createImageBitmap(blob);

      console.log('📐 [IMAGE_PROCESSING] Dimensions IMAGE ORIGINALE:', {
        width: imageBitmap.width,
        height: imageBitmap.height,
        ratio: (imageBitmap.width / imageBitmap.height).toFixed(2)
      });

      // Étape 3 : Créer canvas et redimensionner à 400×400
      const targetSize = 400;
      console.log('🎯 [IMAGE_PROCESSING] Création canvas cible: 400×400');
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Impossible de créer le contexte 2D du canvas');
      }

      // Redimensionnement simple (l'image est censée être carrée)
      console.log('✂️ [IMAGE_PROCESSING] Redimensionnement:', `${imageBitmap.width}×${imageBitmap.height} → 400×400`);
      context.drawImage(imageBitmap, 0, 0, targetSize, targetSize);
      console.log('✅ [IMAGE_PROCESSING] Redimensionnement effectué');

      // Étape 4 : Compression itérative jusqu'à 200Ko max
      const maxSizeBytes = 200 * 1024; // 200Ko
      console.log('🗜️ [IMAGE_PROCESSING] Compression vers max 200Ko...');
      const compressedBlob = await this.compressToSize(canvas, maxSizeBytes);

      console.log('✅ [IMAGE_PROCESSING] ===== IMAGE PRINCIPALE TRAITÉE ===== ', {
        format: 'WebP',
        dimensionsFinales: `${targetSize}×${targetSize}`,
        tailleFinale: `${(compressedBlob.size / 1024).toFixed(2)} Ko`,
        tailleOriginale: `${(uint8ArrayData.length / 1024).toFixed(2)} Ko`,
        réduction: `${(((uint8ArrayData.length - compressedBlob.size) / uint8ArrayData.length) * 100).toFixed(1)}%`
      });

      // Étape 5 : Blob → Uint8Array
      const arrayBuffer = await compressedBlob.arrayBuffer();
      const finalArray = new Uint8Array(arrayBuffer);
      console.log('🎁 [IMAGE_PROCESSING] Retour Uint8Array, taille:', finalArray.length, 'bytes');
      
      return finalArray;

    } catch (error) {
      console.error('💥 [IMAGE_PROCESSING] ERREUR TRAITEMENT:', error);
      console.error('💥 [IMAGE_PROCESSING] Stack:', (error as Error).stack);
      
      // Fallback : retourner l'image originale
      console.warn('⚠️ [IMAGE_PROCESSING] FALLBACK: Utilisation image originale sans traitement');
      if (typeof imageData === 'string') {
        const fallbackData = this.convertBase64ToUint8Array(imageData);
        console.warn('⚠️ [IMAGE_PROCESSING] Retour image originale (base64 converti):', fallbackData.length, 'bytes');
        return fallbackData;
      }
      console.warn('⚠️ [IMAGE_PROCESSING] Retour image originale (Uint8Array):', imageData.length, 'bytes');
      return imageData;
    }
  }

  /**
   * Convertit une chaîne base64 en Uint8Array
   * 
   * @param base64String Chaîne base64 (avec ou sans préfixe data:image)
   * @returns Uint8Array contenant les données de l'image
   */
  private convertBase64ToUint8Array(base64String: string): Uint8Array {
    // Enlever le préfixe si présent (data:image/png;base64,...)
    let base64Data = base64String;
    if (base64String.includes(',')) {
      base64Data = base64String.split(',')[1];
    }

    // Décoder le base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Uint8Array(byteNumbers);
  }
}

