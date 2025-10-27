/**
 * Script pour extraire le contenu des pages projets
 * 
 * Usage: node scripts/extract-project-content.js
 */

const https = require('https');
const fs = require('fs');

const PROJECT_URLS = [
  {
    key: 'creation-jardin-etterbeek',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/creation-jardin-etterbeek.html',
    title: 'Création jardin Etterbeek'
  },
  {
    key: 'maison-horta',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/creation-jardin-avenue-louise.html',
    title: 'Maison Horta'
  },
  {
    key: 'potager-urbain',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/jardinier-bruxelles-potager.html',
    title: 'Potager urbain'
  },
  {
    key: 'amenagement-jardin',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/amenagement-jardin-etterbeek.html',
    title: 'Aménagement jardin'
  },
  {
    key: 'entretien-jardin-uccle',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/entretien-jardin-uccle.html',
    title: 'Entretien jardin Uccle'
  }
];

/**
 * Fetch HTML depuis une URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Nettoie le texte HTML en enlevant les balises
 */
function stripHTML(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
    .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extrait le contenu entre les balises spécifiées
 */
function extractProjectContent(html) {
  // Rechercher le début du contenu
  const startMarker = 'project-details-content p_relative d_block';
  const endMarker = '</div></div></div>'; // Fin potentielle
  
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) {
    console.warn('❌ Marqueur de début non trouvé');
    return '';
  }
  
  // Extraire une grande portion de texte après le début
  let contentStart = html.indexOf('content-one', startIndex);
  if (contentStart === -1) {
    contentStart = startIndex;
  }
  
  // Prendre 3000 caractères après le début pour capturer le contenu principal
  let extracted = html.substring(contentStart, contentStart + 3000);
  
  return stripHTML(extracted);
}

/**
 * Extrait aussi une description courte depuis la balise H1
 */
function extractTitle(html) {
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  if (h1Match) {
    return stripHTML(h1Match[1]);
  }
  return '';
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Début extraction du contenu des projets...\n');
  
  const projects = [];
  
  for (const project of PROJECT_URLS) {
    console.log(`📄 Extraction de ${project.title}...`);
    
    try {
      const html = await fetchHTML(project.url);
      const content = extractProjectContent(html);
      const title = extractTitle(html);
      
      if (!content || content.length < 100) {
        console.warn(`⚠️  Contenu insuffisant pour ${project.title} (${content.length} caractères)`);
      } else {
        projects.push({
          key: project.key,
          url: project.url,
          title: title || project.title,
          description: content.substring(0, 800) // Limiter à 800 caractères
        });
        
        console.log(`✅ ${project.title}: ${content.length} caractères extraits`);
      }
      
      // Petit délai pour ne pas surcharger
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'extraction de ${project.title}:`, error.message);
    }
    
    console.log('');
  }
  
  // Afficher le résultat
  console.log('═══════════════════════════════════════════════');
  console.log('📋 RÉSULTAT FINAL:');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log(JSON.stringify(projects, null, 2));
  
  // Générer le code TypeScript
  console.log('\n═══════════════════════════════════════════════');
  console.log('📝 CODE TYPESCRIPT GÉNÉRÉ:');
  console.log('═══════════════════════════════════════════════\n');
  
  let tsCode = 'export interface ProjectMapping {\n';
  tsCode += '  key: string;\n';
  tsCode += '  url: string;\n';
  tsCode += '  title: string;\n';
  tsCode += '  description: string;\n';
  tsCode += '}\n\n';
  
  tsCode += 'export const PROJECT_MAPPINGS: ProjectMapping[] = [\n';
  
  projects.forEach((project, index) => {
    tsCode += '  {\n';
    tsCode += `    key: '${project.key}',\n`;
    tsCode += `    url: '${project.url}',\n`;
    tsCode += `    title: '${project.title.replace(/'/g, "\\'")}',\n`;
    tsCode += `    description: '${project.description.replace(/'/g, "\\'").replace(/\n/g, ' ')}'\n`;
    tsCode += '  }';
    
    if (index < projects.length - 1) {
      tsCode += ',\n';
    } else {
      tsCode += '\n';
    }
  });
  
  tsCode += '];\n';
  
  console.log(tsCode);
  
  // Sauvegarder dans un fichier
  fs.writeFileSync('scripts/extracted-projects.ts', tsCode);
  console.log('\n✅ Fichier généré: scripts/extracted-projects.ts');
}

// Lancer le script
main().catch(console.error);
