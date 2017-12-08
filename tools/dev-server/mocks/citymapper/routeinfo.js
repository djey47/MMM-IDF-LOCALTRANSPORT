const { extractLineFromRoute } = require('../utils');

const getRoutes = (route) => {
  const line = extractLineFromRoute(route);
  return [{
    status: {
      summary: 'Trafic perturbé',
      description: 'Ligne L : Saint-Cloud/Garches interrompu\n\nDirection(s) concernée(s) :\nParis Saint-LazareSaint-Nom-la-Bretèche\nTrafic interrompu entre Saint-Cloud et Garches Marnes la Coquette jusqu\'en fin de soirée.\r\nPour quitter ou rejoindre les gares de :\r\n, cliquez sur le lien concerné.\r\nEntre Garches Marnes la Coquette et Saint-Cloud, il est possible d\'emprunter les lignes régulières de bus 360 et 460.\r\nDes trains circulent entre Saint-Nom la Bretèche et Garches Marnes la Coquette. \r\nPour se déplacer entre Paris et Saint-Nom la Bretèche, emprunter la ligne A du RER entre La Défense et Saint-Germain en Laye, puis les bus réguliers entre Saint-Germain en Laye et Saint-Nom la Bretèche, ou la Grande Ceinture Ouest reliant Saint-Germain en Laye Grande Ceinture et Noisy le Roi.\r\nMotif : chute d\'un arbre sur la caténaire liée aux conditions météorologiques.\r\n\n\n\n\nLigne L : Paris/Versailles RD fortement ralenti\n\nDirection(s) concernée(s) :\nParis Saint-LazareVersailles Rive Droite\nLe trafic est fortement ralenti entre Paris Saint-Lazare, Saint-Cloud et Versailles Rive Droite\r\nMotif : chute d\'un arbre sur la caténaire liée aux conditions météorologiques.\r\n\n\n',
      level: 1,
    },
    supports_routeinfo: true,
    name: line.toLowerCase(),
    patterns: [],
    color: '#7584BC',
    live_availability: 0,
    brand: 'Transilien',
    long_name: 'Transilien L',
    text_color: '#FFFFFF',
    url: 'https://citymapper.com/paris/l/transilien-l',
    icon_name: 'fr-paris-TransilienL',
    mode: 'rail',
    aliases: [ 'transilien-l' ],
    icon_contains_name: true,
    ui_color: '#7584BC',
    live_line_code: 'TransilienL',
  }];
};

module.exports = {
  path: '/citymapper/routeinfo',
  method: 'GET',
  template: {
    routes: (params, { route }) => getRoutes(route),
  },
};
