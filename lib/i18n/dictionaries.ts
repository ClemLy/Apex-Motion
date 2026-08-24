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
        "Sept décennies d'ingénierie Porsche, condensées dans un moteur de rendu temps réel.",
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
    silhouette: {
      kicker: "Module 04 / continuité de forme",
      title: "LA SILHOUETTE",
      titleAccent: "CONTINUE",
      subtitle:
        "Sept voitures du Studio, un seul profil qui n'a jamais cessé de se retoucher.",
    },
    aero: {
      kicker: "Module 03 / soufflerie",
      title: "LIGNES",
      titleAccent: "D'APPUI",
      subtitle:
        "Cx et appui aérodynamique : une lecture illustrative, pas une fiche technique certifiée de la GT3 RS.",
      cxLabel: "Traînée Cx",
      downforceLabel: "Appui",
    },
    heritage: {
      kicker: "Module 05 / archives",
      title: "HÉRITAGE",
      subtitle:
        "Sept décennies d'ingénierie à plat, du flat-4 originel de la 356 au flat-6 moderne de la GT3 RS.",
      statsKicker: "En chiffres",
      statsTitle: "L'ARC BOXER",
      stats: {
        decades: "Décennies de moteurs à plat",
        power: "Puissance maximale",
        speed: "Vitesse maximale",
        models: "Modèles dans le Studio",
      },
      cooling: {
        air: "Refroidissement air",
        liquide: "Refroidissement liquide",
      },
      cylinders: "cylindres à plat",
      story: {
        kicker: "Un peu d'histoire",
        paragraphs: [
          "1948. Ferry Porsche assemble la 356 dans un atelier autrichien avec les moyens du bord : un flat-4 emprunté à la Coccinelle, une carrosserie allégée à l'extrême, et une conviction simple : la voiture doit servir le conducteur, pas l'inverse. Quinze ans plus tard, ce même flat-4 devient flat-6 sur la toute première 911. La silhouette qui en naît n'a, pour l'essentiel, jamais changé.",
          "Pendant trois décennies, le flat-6 refroidi par air pousse ce châssis dans toutes ses directions, jusqu'à ce que la 959 y greffe une transmission intégrale et une paire de turbos empruntés à la compétition, préfigurant les Porsche à venir. Puis vient 1998 : la 996 abandonne l'air pour le liquide, un choix qui divise les puristes sur le moment et s'impose comme une évidence avec le recul.",
          "Le Studio ne s'arrête pourtant pas au flat-6. Trois voitures y racontent une autre histoire : la 917K, flat-12 vainqueur du Mans en 1970 et sans doute le moteur de course le plus célèbre de la marque ; la 918 Spyder, V8 hybride qui prouvait dès 2013 qu'électrification et pilotage pur pouvaient coexister ; et la Mission R, concept 100 % électrique qui esquisse la compétition Porsche de demain. Trois ruptures, une même obsession.",
        ],
      },
      fleet: {
        kicker: "Module 06 / la collection",
        title: "LE GARAGE",
        subtitle:
          "Les sept voitures du Studio : le flat-6 en fil conducteur, et trois ruptures qui l'ont mis à l'épreuve.",
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
        "Seven decades of Porsche engineering, condensed into a real-time render engine.",
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
    silhouette: {
      kicker: "Module 04 / continuity of form",
      title: "THE SHAPE",
      titleAccent: "NEVER BREAKS",
      subtitle:
        "Seven cars from the Studio, one profile that never stopped revising itself.",
    },
    aero: {
      kicker: "Module 03 / wind tunnel",
      title: "LINES",
      titleAccent: "OF DOWNFORCE",
      subtitle:
        "Cx and aero downforce: an illustrative reading, not a certified spec sheet for the GT3 RS.",
      cxLabel: "Drag Cx",
      downforceLabel: "Downforce",
    },
    heritage: {
      kicker: "Module 05 / archive",
      title: "HERITAGE",
      subtitle:
        "Seven decades of flat-engine thinking, from the 356's original flat-4 to the GT3 RS's modern flat-6.",
      statsKicker: "By the numbers",
      statsTitle: "THE BOXER ARC",
      stats: {
        decades: "Decades of flat engines",
        power: "Peak power",
        speed: "Top speed",
        models: "Models in the Studio",
      },
      cooling: {
        air: "Air-cooled",
        liquide: "Water-cooled",
      },
      cylinders: "flat cylinders",
      story: {
        kicker: "A brief history",
        paragraphs: [
          "1948. Ferry Porsche builds the 356 in an Austrian workshop with what's on hand: a flat-4 borrowed from the Beetle, a body stripped to the essential, and one simple conviction: the car should serve the driver, not the other way around. Fifteen years later, that same flat-4 becomes a flat-6 in the very first 911. The silhouette it produces has barely changed since.",
          "For three decades, the air-cooled flat-6 pushes that chassis in every direction, until the 959 grafts on all-wheel drive and a pair of turbos borrowed from competition, previewing the Porsches to come. Then 1998: the 996 trades air for liquid, a call that splits purists at the time and reads as obvious in hindsight.",
          "The Studio doesn't stop at the flat-6, though. Three cars here tell a different story: the 917K, a flat-12 that won Le Mans in 1970 and remains arguably the marque's most famous racing engine; the 918 Spyder, a hybrid V8 that proved as early as 2013 that electrification and pure driving could coexist; and the Mission R, a fully electric concept sketching Porsche competition's future. Three breaks from the pattern, one obsession.",
        ],
      },
      fleet: {
        kicker: "Module 06 / the collection",
        title: "THE GARAGE",
        subtitle:
          "The Studio's seven cars: the flat-6 as throughline, and three breaks that put it to the test.",
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
