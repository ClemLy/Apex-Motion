export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const dictionaries = {
  fr: {
    nav: {
      home: "Accueil",
      configurator: "Studio",
      soundbox: "Sonorité",
      heritage: "Héritage",
      audioOn: "Audio activé",
      audioOff: "Audio coupé",
    },
    cursor: {
      drag: "Glisser",
      view: "Voir",
      explore: "Explorer",
      audio: "Audio",
      orbit: "Orbiter",
      rev: "Accélérer",
      copy: "Copier",
      toggle: "Basculer",
    },
    hud: {
      system: "Système",
      render: "Rendu",
      drag: "Traînée Cx",
      downforce: "Appui",
      temp: "Température",
      rpm: "Régime",
      chassis: "Châssis",
      sector: "Secteur",
      live: "En direct",
      scroll: "Défiler",
      coolant: "Liquide de refroidissement",
      oil: "Pression d'huile",
      circuit: "Circuit",
      position: "Position",
    },
    preloader: {
      title: "Séquence de démarrage",
      enter: "Démarrer",
      hint: "Cliquez n'importe où (ou appuyez sur Espace) pour entrer",
      stages: [
        "Initialisation du système",
        "Compilation des nuanceurs",
        "Chargement de la géométrie",
        "Étalonnage de la soufflerie",
        "Mise sous tension du moteur",
      ],
    },
    kinetic: {
      words: ["Précision", "Obsession", "Ingénierie", "Héritage", "Apex"],
      statement:
        "Sept décennies de flat-6, condensées dans un moteur de rendu temps réel.",
    },
    hero: {
      kicker: "Évolution flat-6 / édition numérique",
      title1: "FLAT-6",
      title2: "ÉVOLUTION",
      subtitle:
        "Une exploration immersive de l'ingénierie Porsche. Aucun prix, aucune transaction. Uniquement la passion, la précision et le mouvement.",
      cta: "Entrer dans le studio",
      ctaSecondary: "Explorer l'héritage",
      telemetry: {
        rpm: "Régime moteur",
        gforce: "Force G",
        downforce: "Appui aérodynamique",
        topSpeed: "Vitesse max",
      },
    },
    configurator: {
      kicker: "Module 01 / studio en temps réel — modèles Porsche réels",
      title: "STUDIO DE",
      titleAccent: "PERSONNALISATION",
      subtitle:
        "Chaque changement est rendu en direct sur un modèle 3D scanné. Aucune image statique, uniquement de la géométrie et des matériaux dynamiques.",
      carSwitcher: "Modèle",
      tabs: {
        paint: "Peinture",
        aero: "Aéro",
        wheels: "Jantes",
      },
      paint: {
        title: "Peinture et finition",
        solid: "Couleurs de série",
        metallic: "Couleurs métallisées",
        satin: "Finitions satinées",
        matte: "Couleurs mates",
        pts: "Paint to Sample",
      },
      aero: {
        title: "Aéro",
        wing: "Aileron carbone",
      },
      wheels: {
        title: "Jantes et freinage",
        calipers: "Étriers de frein",
        pccb: "PCCB Jaune",
        red: "Guards Red",
      },
      showroom: {
        notice: "Pièce de vitrine — personnalisation indisponible",
        exterior: "Extérieur",
        rear: "Arrière",
        wheels: "Jantes",
        displacement: "Cylindrée",
        power: "Puissance",
        weight: "Poids",
      },
      resetLabel: "Réinitialiser",
      loadingModel: "Chargement du modèle 3D",
    },
    soundbox: {
      kicker: "Module 02 / laboratoire sonore",
      title: "SONORITÉ",
      titleAccent: "MOTEUR",
      subtitle:
        "Testez la sonorité de différentes lignes d'échappement. Synthèse audio en temps réel, aucun fichier préenregistré.",
      lines: {
        oem: "Origine constructeur",
        titanium: "Titane course",
        straight: "Ligne directe",
      },
      rev: "Maintenir pour accélérer",
      release: "Relâcher pour retomber",
    },
    heritage: {
      kicker: "Module 03 / archives",
      title: "HÉRITAGE",
      subtitle:
        "Sept décennies d'ingénierie flat-6, de la 356 originelle à la GT3 RS moderne.",
    },
    footer: {
      disclaimer:
        "APEX // MOTION est un projet indépendant à but non commercial, non affilié à Dr. Ing. h.c. F. Porsche AG.",
      rights: "Tous droits réservés",
    },
  },
  en: {
    nav: {
      home: "Home",
      configurator: "Studio",
      soundbox: "Sound",
      heritage: "Heritage",
      audioOn: "Audio on",
      audioOff: "Audio off",
    },
    cursor: {
      drag: "Drag",
      view: "View",
      explore: "Explore",
      audio: "Audio",
      orbit: "Orbit",
      rev: "Rev",
      copy: "Copy",
      toggle: "Toggle",
    },
    hud: {
      system: "System",
      render: "Render",
      drag: "Drag Cx",
      downforce: "Downforce",
      temp: "Temperature",
      rpm: "Engine speed",
      chassis: "Chassis",
      sector: "Sector",
      live: "Live",
      scroll: "Scroll",
      coolant: "Coolant",
      oil: "Oil pressure",
      circuit: "Circuit",
      position: "Position",
    },
    preloader: {
      title: "Start-up sequence",
      enter: "Ignition",
      hint: "Click anywhere (or press Space) to enter",
      stages: [
        "System initialisation",
        "Compiling shaders",
        "Loading geometry",
        "Wind tunnel calibration",
        "Engine power-up",
      ],
    },
    kinetic: {
      words: ["Precision", "Obsession", "Engineering", "Heritage", "Apex"],
      statement:
        "Seven decades of flat-6, condensed into a real-time render engine.",
    },
    hero: {
      kicker: "Flat-6 evolution / digital edition",
      title1: "FLAT-6",
      title2: "EVOLUTION",
      subtitle:
        "An immersive exploration of Porsche engineering. No pricing, no transaction. Only passion, precision and motion.",
      cta: "Enter the studio",
      ctaSecondary: "Explore the heritage",
      telemetry: {
        rpm: "Engine speed",
        gforce: "G-force",
        downforce: "Aero downforce",
        topSpeed: "Top speed",
      },
    },
    configurator: {
      kicker: "Module 01 / real-time studio — real Porsche scans",
      title: "CUSTOMIZATION",
      titleAccent: "STUDIO",
      subtitle:
        "Every change renders live on a scanned 3D model. No static imagery, only dynamic geometry and materials.",
      carSwitcher: "Model",
      tabs: {
        paint: "Paint",
        aero: "Aero",
        wheels: "Wheels",
      },
      paint: {
        title: "Paint and finish",
        solid: "Solid colors",
        metallic: "Metallic colors",
        satin: "Satin finishes",
        matte: "Matte colors",
        pts: "Paint to Sample",
      },
      aero: {
        title: "Aero",
        wing: "Carbon wing",
      },
      wheels: {
        title: "Wheels and braking",
        calipers: "Brake calipers",
        pccb: "PCCB Yellow",
        red: "Guards Red",
      },
      showroom: {
        notice: "Showroom piece — customization unavailable",
        exterior: "Exterior",
        rear: "Rear",
        wheels: "Wheels",
        displacement: "Displacement",
        power: "Power",
        weight: "Weight",
      },
      resetLabel: "Reset",
      loadingModel: "Loading 3D model",
    },
    soundbox: {
      kicker: "Module 02 / sound lab",
      title: "ENGINE",
      titleAccent: "SOUND",
      subtitle:
        "Test different exhaust lines. Real-time audio synthesis, no prerecorded files.",
      lines: {
        oem: "Factory OEM",
        titanium: "Titanium race",
        straight: "Straight pipe",
      },
      rev: "Hold to rev",
      release: "Release to fall",
    },
    heritage: {
      kicker: "Module 03 / archive",
      title: "HERITAGE",
      subtitle:
        "Seven decades of flat-6 engineering, from the original 356 to the modern GT3 RS.",
    },
    footer: {
      disclaimer:
        "APEX // MOTION is an independent, non-commercial project, not affiliated with Dr. Ing. h.c. F. Porsche AG.",
      rights: "All rights reserved",
    },
  },
} as const;

export type Dictionary = typeof dictionaries.fr;
