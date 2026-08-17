export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const dictionaries = {
  fr: {
    nav: {
      home: "Accueil",
      configurator: "Studio",
      soundbox: "Sonorite",
      heritage: "Heritage",
      garage: "Garage",
      audioOn: "Audio active",
      audioOff: "Audio coupe",
    },
    hero: {
      kicker: "Evolution flat-6 / edition numerique",
      title1: "FLAT-6",
      title2: "EVOLUTION",
      subtitle:
        "Une exploration immersive de l'ingenierie Porsche. Aucun prix, aucune transaction. Uniquement la passion, la precision et le mouvement.",
      cta: "Entrer dans le studio",
      ctaSecondary: "Explorer l'heritage",
      telemetry: {
        rpm: "Regime moteur",
        gforce: "Force G",
        downforce: "Appui aerodynamique",
        topSpeed: "Vitesse max",
      },
    },
    configurator: {
      kicker: "Module 01 / studio en temps reel",
      title: "STUDIO DE",
      titleAccent: "PERSONNALISATION",
      subtitle:
        "Chaque changement est rendu en direct dans le moteur 3D. Aucune image statique, uniquement de la geometrie et des materiaux dynamiques.",
      tabs: {
        paint: "Peinture",
        aero: "Aero",
        wheels: "Jantes",
        interior: "Interieur",
      },
      paint: {
        title: "Peinture et finition",
        metallic: "Metallise",
        matte: "Mat",
        pts: "Paint to Sample",
      },
      aero: {
        title: "Aero et carrosserie",
        wing: "Aileron fixe",
        splitter: "Splitter avant",
        widebody: "Carrosserie elargie",
      },
      wheels: {
        title: "Jantes et freinage",
        calipers: "Etriers de frein",
        pccb: "PCCB Jaune",
        red: "Guards Red",
      },
      interior: {
        title: "Cabine et interieur",
        leather: "Cuir",
        alcantara: "Alcantara",
        rollcage: "Arceau cage",
      },
      resetLabel: "Reinitialiser",
      viewCabin: "Inspecter l'habitacle",
      viewExterior: "Vue exterieure",
    },
    soundbox: {
      kicker: "Module 02 / laboratoire sonore",
      title: "SONORITE",
      titleAccent: "MOTEUR",
      subtitle:
        "Testez la sonorite de differentes lignes d'echappement. Synthese audio en temps reel, aucun fichier preenregistre.",
      lines: {
        oem: "Origine constructeur",
        titanium: "Titane course",
        straight: "Ligne directe",
      },
      rev: "Maintenir pour accelerer",
      release: "Relacher pour retomber",
    },
    heritage: {
      kicker: "Module 03 / archives",
      title: "HERITAGE",
      subtitle:
        "Sept decennies d'ingenierie flat-6, de la 356 originelle a la GT3 RS moderne.",
    },
    garage: {
      kicker: "Module 04 / communaute",
      title: "GARAGE",
      titleAccent: "COMMUNAUTAIRE",
      subtitle:
        "Configurations partagees par la communaute. Telechargez les rendus 4K ou copiez le code de configuration.",
      download: "Rendu 4K",
      copyCode: "Copier le code",
      copied: "Copie",
    },
    footer: {
      disclaimer:
        "APEX // MOTION est un projet independant a but non commercial, non affilie a Dr. Ing. h.c. F. Porsche AG.",
      rights: "Tous droits reserves",
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
