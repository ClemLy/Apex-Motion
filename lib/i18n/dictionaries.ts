export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const dictionaries = {
  fr: {
    nav: {
      home: "Accueil",
      configurator: "Studio",
      heritage: "Héritage",
      audioOn: "Audio activé",
      audioOff: "Audio coupé",
      menuOpen: "Ouvrir le menu",
      menuClose: "Fermer le menu",
      changeLanguage: "Passer en anglais",
    },
    a11y: {
      heroShowcase: "vue décorative en rotation, ne réagit pas au clavier",
      studioViewport:
        "aperçu du Studio, se met à jour selon les réglages choisis",
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
      kicker: "Module 01 / studio en temps réel",
      title: "STUDIO DE",
      titleAccent: "PERSONNALISATION",
      subtitle:
        "Chaque choix prend vie en direct sur la carrosserie scannée de la voiture. Rien n'est figé, tout répond au geste.",
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
        notice: "Pièce de vitrine, personnalisation indisponible",
        exterior: "Extérieur",
        rear: "Arrière",
        wheels: "Jantes",
        displacement: "Cylindrée",
        power: "Puissance",
        weight: "Poids",
      },
      compare: {
        button: "Comparer",
        before: "Avant",
        after: "Après",
        exit: "Quitter",
      },
      capture: "Capturer",
      visualizer: {
        button: "Visualiser",
        kicker: "Vue libre",
        close: "Fermer",
        hint: "Glisser pour orbiter, molette pour zoomer",
      },
      resetLabel: "Réinitialiser",
      loadingModel: "Chargement du modèle 3D",
    },
    telemetry: {
      kicker: "Module 02 / relevé de tour",
      title: "TRACÉ",
      titleAccent: "TÉLÉMÉTRIE",
      subtitle:
        "Vitesse, freinages, appuis latéraux : une interprétation du tour, pas un relevé réel.",
      trackName: "Nürburgring Nordschleife",
      stats: {
        speed: "Vitesse",
        gForce: "Force G",
        brake: "Freinage",
      },
      sectorLabel: "Secteur",
    },
    heritage: {
      kicker: "Module 03 / archives",
      title: "HÉRITAGE",
      subtitle:
        "Sept décennies d'ingénierie flat-6, de la 356 originelle à la GT3 RS moderne.",
      statsKicker: "En chiffres",
      statsTitle: "L'ARC FLAT-6",
      stats: {
        decades: "Décennies de flat-6",
        power: "Puissance maximale",
        speed: "Vitesse maximale",
        models: "Modèles dans le Studio",
      },
      fleet: {
        kicker: "Module 04 / la collection",
        title: "LE GARAGE",
        subtitle:
          "Les sept voitures du Studio, dans l'ordre où l'ingénierie flat-6 les a vues naître.",
      },
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
      heritage: "Heritage",
      audioOn: "Audio on",
      audioOff: "Audio off",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      changeLanguage: "Switch to French",
    },
    a11y: {
      heroShowcase: "decorative rotating view, not keyboard-interactive",
      studioViewport: "Studio preview, updates live with your selections",
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
      kicker: "Module 01 / real-time studio",
      title: "CUSTOMIZATION",
      titleAccent: "STUDIO",
      subtitle:
        "Every choice comes alive on the car's own scanned body. Nothing here is static, everything answers to your hand.",
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
        notice: "Showroom piece, customization unavailable",
        exterior: "Exterior",
        rear: "Rear",
        wheels: "Wheels",
        displacement: "Displacement",
        power: "Power",
        weight: "Weight",
      },
      compare: {
        button: "Compare",
        before: "Before",
        after: "After",
        exit: "Exit",
      },
      capture: "Capture",
      visualizer: {
        button: "Visualize",
        kicker: "Free view",
        close: "Close",
        hint: "Drag to orbit, scroll to zoom",
      },
      resetLabel: "Reset",
      loadingModel: "Loading 3D model",
    },
    telemetry: {
      kicker: "Module 02 / lap readout",
      title: "TRACK",
      titleAccent: "TELEMETRY",
      subtitle:
        "Speed, braking, lateral G: an interpretation of the lap, not a real readout.",
      trackName: "Nürburgring Nordschleife",
      stats: {
        speed: "Speed",
        gForce: "G-Force",
        brake: "Braking",
      },
      sectorLabel: "Sector",
    },
    heritage: {
      kicker: "Module 03 / archive",
      title: "HERITAGE",
      subtitle:
        "Seven decades of flat-6 engineering, from the original 356 to the modern GT3 RS.",
      statsKicker: "By the numbers",
      statsTitle: "THE FLAT-6 ARC",
      stats: {
        decades: "Decades of flat-6",
        power: "Peak power",
        speed: "Top speed",
        models: "Models in the Studio",
      },
      fleet: {
        kicker: "Module 04 / the collection",
        title: "THE GARAGE",
        subtitle:
          "The Studio's seven cars, in the order flat-6 engineering brought them into being.",
      },
    },
    footer: {
      disclaimer:
        "APEX // MOTION is an independent, non-commercial project, not affiliated with Dr. Ing. h.c. F. Porsche AG.",
      rights: "All rights reserved",
    },
  },
} as const;

export type Dictionary = typeof dictionaries.fr;
