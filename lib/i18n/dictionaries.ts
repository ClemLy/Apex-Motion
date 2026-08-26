export const locales = ["fr", "en", "de"] as const;
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
      sections: {
        hero: "Présentation — Flat-6 Évolution",
        telemetry: "Relevé de tour sur circuit",
        aero: "Soufflerie — lignes d'appui",
        silhouette: "Continuité de forme — évolution des silhouettes",
        particles: "GT3 RS — assemblage 3D",
        outro: "Accès au Studio",
        configuratorTeaser: "Aperçu du Studio",
        heritageStats: "Héritage — statistiques",
        heritageFleet: "Collection — les sept voitures",
      },
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
      title: "LA FORME",
      titleAccent: "VOUS APPARTIENT",
      subtitle:
        "Une teinte se pose, une jante se choisit : la carrosserie qui attendait dans l'ombre devient, geste après geste, la vôtre.",
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
      title: "UN TOUR,",
      titleAccent: "SANS RELÂCHE",
      subtitle:
        "Le freinage arrive tard, l'appui grimpe en courbe, la corde se prend sans y penser : la Nordschleife tenue d'un seul geste.",
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
        "Sept voitures, un seul trait qui n'a jamais cessé de se retoucher depuis 1948.",
    },
    aero: {
      kicker: "Module 03 / soufflerie",
      title: "LIGNES",
      titleAccent: "D'APPUI",
      subtitle:
        "L'air se sépare au museau, glisse jusqu'au becquet, et retombe enfin, dompté, plaquant la voiture au bitume.",
      cxLabel: "Traînée Cx",
      downforceLabel: "Appui",
    },
    particleAssembly: {
      kicker: "Module 05 / la GT3 RS en résumé",
      title: "525 CHEVAUX.",
      titleAccent: "AUCUNE CONCESSION.",
      subtitle:
        "Le plus grand aileron jamais monté sur une 911 de route, hérité tout droit de la compétition : ici, la vitesse n'est pas un chiffre, c'est une décision.",
    },
    outro: {
      kicker: "Fin de la visite",
      title: "LA PAGE",
      titleAccent: "S'ARRÊTE ICI",
      subtitle:
        "Le Studio, lui, ne fait que commencer. Entrez, et faites de cette GT3 RS la vôtre.",
      cta: "Ouvrir le studio",
    },
    heritage: {
      kicker: "Module 06 / archives",
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
        kicker: "Module 07 / la collection",
        title: "LE GARAGE",
        subtitle:
          "Les sept voitures du Studio : le flat-6 en fil conducteur, et trois ruptures qui l'ont mis à l'épreuve.",
      },
    },
    footer: {
      disclaimer:
        "APEX // MOTION est un projet indépendant à but non commercial, non affilié à Dr. Ing. h.c. F. Porsche AG.",
      rights: "Tous droits réservés",
      navLabel: "Navigation du site",
      credit: "Conçu par",
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
      changeLanguage: "Switch to German",
    },
    a11y: {
      heroShowcase: "decorative rotating view, not keyboard-interactive",
      studioViewport: "Studio preview, updates live with your selections",
      sections: {
        hero: "Flat-6 Evolution — showcase",
        telemetry: "Lap telemetry on circuit",
        aero: "Wind tunnel — downforce lines",
        silhouette: "Continuity of form — silhouette evolution",
        particles: "GT3 RS — 3D assembly",
        outro: "Studio access",
        configuratorTeaser: "Studio preview",
        heritageStats: "Heritage — statistics",
        heritageFleet: "Collection — all seven cars",
      },
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
      title: "THE FORM,",
      titleAccent: "NOW YOURS",
      subtitle:
        "A shade settles. A wheel is chosen. The bodywork that waited in the shadow turns, gesture by gesture, into something only yours.",
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
      title: "ONE LAP,",
      titleAccent: "NO LETTING UP",
      subtitle:
        "Braking arrives late, grip climbs through the corner, the apex comes without thinking: the Nordschleife held in one continuous motion.",
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
      subtitle: "Seven cars, one line still being redrawn since 1948.",
    },
    aero: {
      kicker: "Module 03 / wind tunnel",
      title: "LINES",
      titleAccent: "OF DOWNFORCE",
      subtitle:
        "Air splits at the nose, rides the roofline, and finally falls away, tamed, pressing the car flat to the asphalt.",
      cxLabel: "Drag Cx",
      downforceLabel: "Downforce",
    },
    particleAssembly: {
      kicker: "Module 05 / the GT3 RS, in short",
      title: "525 HORSEPOWER.",
      titleAccent: "ZERO COMPROMISE.",
      subtitle:
        "The largest wing ever fitted to a road-going 911, pulled straight from competition: here, speed isn't a number, it's a decision.",
    },
    outro: {
      kicker: "End of the tour",
      title: "THE PAGE",
      titleAccent: "STOPS HERE",
      subtitle: "The Studio doesn't. Step in, and make this GT3 RS yours.",
      cta: "Open the studio",
    },
    heritage: {
      kicker: "Module 06 / archive",
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
        kicker: "Module 07 / the collection",
        title: "THE GARAGE",
        subtitle:
          "The Studio's seven cars: the flat-6 as throughline, and three breaks that put it to the test.",
      },
    },
    footer: {
      disclaimer:
        "APEX // MOTION is an independent, non-commercial project, not affiliated with Dr. Ing. h.c. F. Porsche AG.",
      rights: "All rights reserved",
      navLabel: "Site navigation",
      credit: "Built by",
    },
  },
  de: {
    nav: {
      home: "Start",
      configurator: "Studio",
      heritage: "Erbe",
      audioOn: "Audio ein",
      audioOff: "Audio aus",
      menuOpen: "Menü öffnen",
      menuClose: "Menü schließen",
      changeLanguage: "Auf Französisch wechseln",
    },
    a11y: {
      heroShowcase: "dekorative Rotationsansicht, nicht per Tastatur bedienbar",
      studioViewport:
        "Studio-Vorschau, aktualisiert sich live entsprechend Ihrer Auswahl",
      sections: {
        hero: "Präsentation — Flat-6 Evolution",
        telemetry: "Rundenmessung auf der Strecke",
        aero: "Windkanal — Abtriebslinien",
        silhouette: "Formkontinuität — Silhouettenentwicklung",
        particles: "GT3 RS — 3D-Zusammenbau",
        outro: "Zugang zum Studio",
        configuratorTeaser: "Studio-Vorschau",
        heritageStats: "Erbe — Statistiken",
        heritageFleet: "Kollektion — die sieben Fahrzeuge",
      },
    },
    cursor: {
      drag: "Ziehen",
      view: "Ansehen",
      explore: "Erkunden",
      audio: "Audio",
      orbit: "Umkreisen",
      rev: "Hochdrehen",
      copy: "Kopieren",
      toggle: "Umschalten",
    },
    hud: {
      system: "System",
      render: "Rendering",
      drag: "Cw-Wert",
      downforce: "Abtrieb",
      temp: "Temperatur",
      rpm: "Drehzahl",
      chassis: "Fahrwerk",
      sector: "Sektor",
      live: "Live",
      scroll: "Scrollen",
      coolant: "Kühlmitteltemperatur",
      oil: "Öldruck",
      circuit: "Strecke",
      position: "Position",
    },
    preloader: {
      title: "Startsequenz",
      enter: "Starten",
      hint: "Klicken Sie irgendwo (oder drücken Sie die Leertaste), um einzutreten",
      stages: [
        "Systeminitialisierung",
        "Shader werden kompiliert",
        "Geometrie wird geladen",
        "Windkanalkalibrierung",
        "Motor wird hochgefahren",
      ],
    },
    kinetic: {
      words: ["Präzision", "Obsession", "Ingenieurskunst", "Erbe", "Apex"],
      statement:
        "Sieben Jahrzehnte Porsche-Ingenieurskunst, verdichtet in einer Echtzeit-Rendering-Engine.",
    },
    hero: {
      kicker: "Flat-6 Evolution / digitale Edition",
      title1: "FLAT-6",
      title2: "EVOLUTION",
      subtitle:
        "Eine immersive Erkundung der Porsche-Ingenieurskunst. Kein Preis, keine Transaktion. Nur Leidenschaft, Präzision und Bewegung.",
      cta: "Studio betreten",
      ctaSecondary: "Erbe entdecken",
      telemetry: {
        rpm: "Drehzahl",
        gforce: "G-Kraft",
        downforce: "Aerodynamischer Abtrieb",
        topSpeed: "Höchstgeschwindigkeit",
      },
    },
    configurator: {
      kicker: "Modul 01 / Echtzeit-Studio",
      title: "DIE FORM",
      titleAccent: "GEHÖRT IHNEN",
      subtitle:
        "Ein Farbton legt sich an, eine Felge wird gewählt: Die Karosserie, die im Schatten wartete, wird Geste für Geste zu Ihrer eigenen.",
      carSwitcher: "Modell",
      tabs: {
        paint: "Lackierung",
        aero: "Aero",
        wheels: "Felgen",
      },
      paint: {
        title: "Lackierung und Oberfläche",
        solid: "Unifarben",
        metallic: "Metallic-Farben",
        satin: "Satin-Lackierungen",
        matte: "Mattfarben",
        pts: "Paint to Sample",
      },
      aero: {
        title: "Aero",
        wing: "Carbon-Heckflügel",
      },
      wheels: {
        title: "Felgen und Bremsen",
        calipers: "Bremssättel",
        pccb: "PCCB Gelb",
        red: "Guards Red",
      },
      showroom: {
        notice: "Ausstellungsstück, Personalisierung nicht verfügbar",
        exterior: "Außen",
        rear: "Heck",
        wheels: "Felgen",
        displacement: "Hubraum",
        power: "Leistung",
        weight: "Gewicht",
      },
      compare: {
        button: "Vergleichen",
        before: "Vorher",
        after: "Nachher",
        exit: "Beenden",
      },
      capture: "Aufnehmen",
      visualizer: {
        button: "Visualisieren",
        kicker: "Freie Ansicht",
        close: "Schließen",
        hint: "Ziehen zum Umkreisen, Scrollen zum Zoomen",
      },
      resetLabel: "Zurücksetzen",
      loadingModel: "3D-Modell wird geladen",
    },
    telemetry: {
      kicker: "Modul 02 / Rundenmessung",
      title: "EINE RUNDE,",
      titleAccent: "OHNE NACHLASSEN",
      subtitle:
        "Die Bremsung kommt spät, der Abtrieb steigt in der Kurve, der Scheitelpunkt wird ohne Nachdenken getroffen: die Nordschleife in einer einzigen Bewegung gehalten.",
      trackName: "Nürburgring Nordschleife",
      stats: {
        speed: "Geschwindigkeit",
        gForce: "G-Kraft",
        brake: "Bremsung",
      },
      sectorLabel: "Sektor",
    },
    silhouette: {
      kicker: "Modul 04 / Formkontinuität",
      title: "DIE SILHOUETTE",
      titleAccent: "BLEIBT BESTEHEN",
      subtitle:
        "Sieben Fahrzeuge, eine einzige Linie, die seit 1948 nie aufgehört hat, sich zu verfeinern.",
    },
    aero: {
      kicker: "Modul 03 / Windkanal",
      title: "LINIEN",
      titleAccent: "DES ABTRIEBS",
      subtitle:
        "Die Luft teilt sich an der Front, gleitet über die Dachlinie und legt sich schließlich gebändigt auf den Asphalt.",
      cxLabel: "Cw-Wert",
      downforceLabel: "Abtrieb",
    },
    particleAssembly: {
      kicker: "Modul 05 / die GT3 RS im Überblick",
      title: "525 PS.",
      titleAccent: "KEIN KOMPROMISS.",
      subtitle:
        "Der größte je an einem straßenzugelassenen 911 montierte Heckflügel, direkt aus dem Rennsport übernommen: Hier ist Geschwindigkeit keine Zahl, sondern eine Entscheidung.",
    },
    outro: {
      kicker: "Ende der Tour",
      title: "DIE SEITE",
      titleAccent: "ENDET HIER",
      subtitle:
        "Das Studio hingegen fängt gerade erst an. Steigen Sie ein und machen Sie diesen GT3 RS zu Ihrem eigenen.",
      cta: "Studio öffnen",
    },
    heritage: {
      kicker: "Modul 06 / Archiv",
      title: "ERBE",
      subtitle:
        "Sieben Jahrzehnte Boxermotor-Ingenieurskunst, vom ursprünglichen Flat-4 des 356 bis zum modernen Flat-6 des GT3 RS.",
      statsKicker: "In Zahlen",
      statsTitle: "DER BOXER-BOGEN",
      stats: {
        decades: "Jahrzehnte mit Boxermotoren",
        power: "Spitzenleistung",
        speed: "Höchstgeschwindigkeit",
        models: "Modelle im Studio",
      },
      cooling: {
        air: "Luftkühlung",
        liquide: "Wasserkühlung",
      },
      cylinders: "Boxerzylinder",
      story: {
        kicker: "Ein Stück Geschichte",
        paragraphs: [
          "1948. Ferry Porsche baut den 356 in einer österreichischen Werkstatt mit den Mitteln, die zur Verfügung stehen: einem Flat-4 aus dem Käfer entliehen, einer auf das Wesentliche reduzierten Karosserie und einer einfachen Überzeugung: Das Auto soll dem Fahrer dienen, nicht umgekehrt. Fünfzehn Jahre später wird derselbe Flat-4 im allerersten 911 zum Flat-6. Die daraus entstandene Silhouette hat sich seither kaum verändert.",
          "Drei Jahrzehnte lang treibt der luftgekühlte Flat-6 dieses Fahrwerk in jede Richtung, bis der 959 einen Allradantrieb und ein Turbopaar aus dem Rennsport einpflanzt und damit künftige Porsche vorwegnimmt. Dann kommt 1998: Der 996 tauscht Luft gegen Wasser, eine Entscheidung, die Puristen damals spaltet und sich im Rückblick als selbstverständlich erweist.",
          "Das Studio endet jedoch nicht beim Flat-6. Drei Fahrzeuge erzählen hier eine andere Geschichte: der 917K, ein Flat-12, der 1970 Le Mans gewann und wohl der berühmteste Rennmotor der Marke bleibt; der 918 Spyder, ein Hybrid-V8, der bereits 2013 bewies, dass Elektrifizierung und puristisches Fahren koexistieren können; und der Mission R, ein vollelektrisches Konzept, das den Porsche-Rennsport von morgen skizziert. Drei Brüche mit dem Muster, eine gemeinsame Obsession.",
        ],
      },
      fleet: {
        kicker: "Modul 07 / die Kollektion",
        title: "DIE GARAGE",
        subtitle:
          "Die sieben Fahrzeuge des Studios: der Flat-6 als roter Faden, und drei Brüche, die ihn auf die Probe stellten.",
      },
    },
    footer: {
      disclaimer:
        "APEX // MOTION ist ein unabhängiges, nicht-kommerzielles Projekt und nicht mit der Dr. Ing. h.c. F. Porsche AG verbunden.",
      rights: "Alle Rechte vorbehalten",
      navLabel: "Seitennavigation",
      credit: "Entwickelt von",
    },
  },
} as const;

export type Dictionary = typeof dictionaries.fr;
