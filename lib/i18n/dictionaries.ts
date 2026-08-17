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
      garage: "Garage",
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
        "Chaque changement est rendu en direct dans le moteur 3D. Aucune image statique, uniquement de la géométrie et des matériaux dynamiques.",
      tabs: {
        paint: "Peinture",
        aero: "Aéro",
        wheels: "Jantes",
        interior: "Intérieur",
      },
      paint: {
        title: "Peinture et finition",
        metallic: "Métallisé",
        matte: "Mat",
        pts: "Paint to Sample",
      },
      aero: {
        title: "Aéro et carrosserie",
        wing: "Aileron fixe",
        splitter: "Splitter avant",
        widebody: "Carrosserie élargie",
      },
      wheels: {
        title: "Jantes et freinage",
        calipers: "Étriers de frein",
        pccb: "PCCB Jaune",
        red: "Guards Red",
      },
      interior: {
        title: "Cabine et intérieur",
        leather: "Cuir",
        alcantara: "Alcantara",
        rollcage: "Arceau cage",
      },
      resetLabel: "Réinitialiser",
      viewCabin: "Inspecter l'habitacle",
      viewExterior: "Vue extérieure",
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
    garage: {
      kicker: "Module 04 / communauté",
      title: "GARAGE",
      titleAccent: "COMMUNAUTAIRE",
      subtitle:
        "Configurations partagées par la communauté. Téléchargez les rendus 4K ou copiez le code de configuration.",
      download: "Rendu 4K",
      copyCode: "Copier le code",
      copied: "Copié",
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
      garage: "Garage",
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
        "Every change renders live in the 3D engine. No static imagery, only dynamic geometry and materials.",
      tabs: {
        paint: "Paint",
        aero: "Aero",
        wheels: "Wheels",
        interior: "Interior",
      },
      paint: {
        title: "Paint and finish",
        metallic: "Metallic",
        matte: "Matte",
        pts: "Paint to Sample",
      },
      aero: {
        title: "Aero and bodykit",
        wing: "Fixed wing",
        splitter: "Front splitter",
        widebody: "Widebody kit",
      },
      wheels: {
        title: "Wheels and braking",
        calipers: "Brake calipers",
        pccb: "PCCB Yellow",
        red: "Guards Red",
      },
      interior: {
        title: "Cabin and interior",
        leather: "Leather",
        alcantara: "Alcantara",
        rollcage: "Roll cage",
      },
      resetLabel: "Reset",
      viewCabin: "Inspect cabin",
      viewExterior: "Exterior view",
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
    garage: {
      kicker: "Module 04 / community",
      title: "COMMUNITY",
      titleAccent: "GARAGE",
      subtitle:
        "Builds shared by the community. Download 4K renders or copy the configuration code.",
      download: "4K render",
      copyCode: "Copy code",
      copied: "Copied",
    },
    footer: {
      disclaimer:
        "APEX // MOTION is an independent, non-commercial project, not affiliated with Dr. Ing. h.c. F. Porsche AG.",
      rights: "All rights reserved",
    },
  },
} as const;

export type Dictionary = typeof dictionaries.fr;
