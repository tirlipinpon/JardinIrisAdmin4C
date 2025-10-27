export interface ServiceMapping {
  url: string;
  description: string; // Pour l'IA
  key: string; // Clé unique
}

export const SERVICE_MAPPINGS: ServiceMapping[] = [
  {
    key: 'entretien-jardin',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/entretien-de-jardin.html',
    description: 'entretien de jardin, tonte, taille de haies, désherbage, désherbage manuel, soin des massifs'
  },
  {
    key: 'creation-amenagement',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/creation-amenagement-de-jardin.html',
    description: 'création et aménagement de jardin, design paysager, projet d\'aménagement extérieur'
  },
  {
    key: 'plantations-resilientes',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/plantations.html',
    description: 'plantations résiliantes, arbres, arbustes adaptés au climat, végétaux durables'
  },
  {
    key: 'taille-haie',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/taille-de-haie.html',
    description: 'taille de haie, élagage de haies, sculpture de haies, entretien de haies'
  },
  {
    key: 'culture-potagere',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/culture-potagere.html',
    description: 'potager urbain, culture potagère, légumes, jardin potager, potager'
  },
  {
    key: 'tonte-pelouse',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/tonte-de-pelouse.html',
    description: 'tonte de pelouse, entretien de pelouse, soin de la pelouse, pelouse verdoyante'
  },
  {
    key: 'elagage-abatage',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/elagage-abatage-d-arbre.html',
    description: 'élagage et abattage d\'arbre, arboriculture, sécurité des arbres'
  },
  {
    key: 'travaux-terrassement',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/travaux-de-terrassement.html',
    description: 'travaux de terrassement, aménagement de terrain, travaux de terrasse'
  },
  {
    key: 'robot-tondeuse',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-service/robot-tondeuse-installation-reparation.html',
    description: 'robot tondeuse, installation de robot tondeuse, réparation robot tondeuse, tondeuse autonome'
  }
];

