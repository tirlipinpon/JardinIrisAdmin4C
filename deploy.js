const fs = require('fs');
const path = require('path');

console.log('🚀 Script de déploiement Jardin Iris Admin');

// 1. Build de production
console.log('📦 Building application...');
const { execSync } = require('child_process');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build terminé avec succès');
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}

// 2. Vérifier que les fichiers existent
const distPath = path.join(process.cwd(), 'dist', 'JardinIrisAdmin4C', 'browser');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Fichier index.html non trouvé dans dist/');
  process.exit(1);
}

// 3. Lire le contenu de index.html
const indexContent = fs.readFileSync(indexPath, 'utf8');

// 4. Ajouter des meta tags pour éviter le cache
const cacheBuster = Date.now();
const newIndexContent = indexContent.replace(
  '<head>',
  `<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="build-timestamp" content="${cacheBuster}">`
);

// 5. Écrire le nouveau index.html
fs.writeFileSync(indexPath, newIndexContent);

console.log('✅ Meta tags anti-cache ajoutés');
console.log('📁 Fichiers prêts pour le déploiement dans:', distPath);
console.log('🔧 Instructions de déploiement:');
console.log('   1. Uploadez TOUS les fichiers du dossier dist/JardinIrisAdmin4C/browser/');
console.log('   2. Placez-les dans le dossier /admin2/ sur votre serveur');
console.log('   3. Videz le cache de votre navigateur (Ctrl+F5)');
console.log('   4. Testez l\'application');
