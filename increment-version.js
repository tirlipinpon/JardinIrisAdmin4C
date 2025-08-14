const fs = require('fs');
const path = require('path');

// Chemin vers le fichier package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');

console.log('Répertoire de travail:', process.cwd());
console.log('Chemin package.json:', packageJsonPath);

// Lire le fichier package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Incrémenter la version
  const currentVersion = packageJson.version || '0.0.1';
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  const newPatch = (patch || 0) + 1;
  const newVersion = `${major}.${minor}.${String(newPatch).padStart(2, '0')}`;
  packageJson.version = newVersion;
  

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Version incrémentée à: ${newVersion}`);

  // Créer le dossier src/app/shared/services si il n'existe pas
  const srcDir = path.join(process.cwd(), 'src');
  const appDir = path.join(srcDir, 'app');
  const sharedDir = path.join(appDir, 'shared');
  const servicesDir = path.join(sharedDir, 'services');

  console.log('Chemin src:', srcDir);
  console.log('Chemin app:', appDir);
  console.log('Chemin shared:', sharedDir);
  console.log('Chemin services:', servicesDir);

  // Créer les dossiers de manière récursive
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir);
    console.log('Dossier src créé');
  }

  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir);
    console.log('Dossier app créé');
  }

  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir);
    console.log('Dossier shared créé');
  }

  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir);
    console.log('Dossier services créé');
  }

  // Créer un fichier version.ts pour Angular
  const versionContent = `// Ce fichier est généré automatiquement
// Last updated: ${new Date().toISOString()}
export const VERSION = {
  buildNumber: '${newVersion}',
  buildDate: '${new Date().toISOString()}'
};
`;

  // Écrire le fichier version.ts
  const versionFilePath = path.join(servicesDir, 'version.ts');
  fs.writeFileSync(versionFilePath, versionContent);
  console.log(`Fichier version.ts créé à: ${versionFilePath}`);

  // Vérifier que le fichier existe réellement
  if (fs.existsSync(versionFilePath)) {
    console.log('✓ Fichier version.ts confirmé créé');
    const stats = fs.statSync(versionFilePath);
    console.log(`Taille du fichier: ${stats.size} bytes`);
  } else {
    console.log('✗ Échec de la création du fichier');
  }

} catch (error) {
  console.error('Erreur:', error);
}
