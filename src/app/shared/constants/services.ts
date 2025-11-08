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

export interface ProjectMapping {
  key: string;
  url: string;
  title: string;
  description: string;
}

export const PROJECT_MAPPINGS: ProjectMapping[] = [
  {
    key: 'creation-jardin-etterbeek',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/creation-jardin-etterbeek.html',
    title: 'Création d\'un jardin à Etterbeek nécessitant peu d\'entretien.',
    description: 'Remise en état d\'un jardin abandonné à Etterbeek. Projet de jardinage urbain à Bruxelles. Transformation d\'un espace abandonné depuis quatre ans en valorisant les plantes existantes (palmier, rosier). Objectif : redonner charme et fonctionnalité au jardin avec un espace à faible entretien. Revitalisation du sol avec compost, intégration d\'un système d\'arrosage écologique.'
  },
  {
    key: 'maison-horta',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/creation-jardin-avenue-louise.html',
    title: 'Plantation d\'un jardin situé avenue Louise d\'une maison Horta à Bruxelles',
    description: 'Création d\'une plantation pour une exposition artistique dans une propriété Horta Avenue Louise. Composition de graminées variées, anémones, hortensias, palmier et bambou. Sol amendé avec terreau et compost pour développement optimal des plantes.'
  },
  {
    key: 'potager-urbain',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/jardinier-bruxelles-potager.html',
    title: 'Votre potager urbain bio local de saison à Bruxelles',
    description: 'Potager sur sol vivant (MSV) en serre froide. Couverture permanente : paille, drêche de brasserie, feuilles d\'arbres, BRF et plantes couvre-sol. Système d\'irrigation par pompe photovoltaïque. Eau stockée dans citernes cubiques. Techniques agricoles durables.'
  },
  {
    key: 'amenagement-jardin',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/amenagement-jardin-etterbeek.html',
    title: 'Aménagement complet d\'un jardin situé à Etterbeek.',
    description: 'Aménagement par architecte paysagiste Jacques de Liedekerke dans un quartier résidentiel d\'Etterbeek. Terrain très arboré sans réelle zone de jardin. Taille précise des arbres et arbustes pour laisser entrer la lumière. Plantation d\'espèces fleuries et rosiers adaptés aux coins ensoleillés. Sol enrichi avec compost maison et pouzzolane fine.'
  },
  {
    key: 'entretien-jardin-uccle',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/entretien-jardin-uccle.html',
    title: 'Entretien des haies, gazon/pelouse, plantations évolutives d\'un jardin à Uccle',
    description: 'Aménagement paysager à Uccle par architecte Anne-Marie Vercauteren en 2015. Structuration des abords d\'une pelouse étroite pensée comme fleuve végétal. Végétation mêlant arbustes taillés et massifs floraux visibles toute l\'année sauf hiver. Entretien raisonnable par jardinier local, décor vivant et évolutif.'
  },
  {
    key: 'jardin-anglais-woluwe-saint-pierre',
    url: 'https://www.jardin-iris.be/jardinier-paysagiste-projet/jardin-anglais-woluwe-saint-pierre.html',
    title: ' Jardin anglais à Woluwe-Saint-Pierre : élégance et harmonie naturelle, taille de haies et entretien d\'un jardin paysagé à Bruxelles',
    description: 'Taille de haies et entretien d\'un jardin paysagé à Bruxelles Projet : Taille de haies d\'un jardin paysagé bruxellois. Haie d\'ifs composée de topiaires et de charmilles, structure principale d\'un jardin de style franco-belge. Les haies délimitent la roseraie et l\'espace piscine tout en offrant des perspectives soignées. Le jardin a été conçu avec chaque zone pour une fonction précise : décoration, méditation et relaxation. Le jardin, très fleuri, présente une belle collection de rosiers anglais et français invitant le visiteur à la découverte de chaque espace. Entretien : 1x hebdomadaire. Taille des haies : 2x/an. Apports d\'engrais en saison pour favoriser un meilleur développement des haies et des arbustes. Sol : argilo-limoneux, propice aux rhododendrons, hortensias, camélias et rosiers. Les parterres sont enrichis chaque janvier avec du compost maison pour préparer la reprise printanière. Pratiques durables : compost maison, broyage des branches pour BRF, réutilisation des feuilles et tontes — aucun déchet vert n\'est exporté. Résultat estimé : ~2000 € d\'économie sur l\'évacuation des déchets et ~300 € sur l\'achat d\'amendements grâce au recyclage interne. Végétation et floraison : jonquilles au printemps, géraniums vivaces, Iris sibirica, alchemilla, lavandes, ancolies et pivoines pour assurer une floraison échelonnée toute l\'année.'
  }
];

