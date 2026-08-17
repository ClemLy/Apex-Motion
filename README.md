<div align="center">

# APEX // MOTION

**Une exploration numérique immersive de l'ingénierie Porsche.**
Studio de personnalisation 3D en temps réel, laboratoire sonore et archives héritage.

Aucun prix. Aucun panier. Uniquement la passion, la précision et le mouvement.

</div>

---

## Sommaire

- [Vision](#vision)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Démarrage](#démarrage)
- [Scripts disponibles](#scripts-disponibles)
- [Modules](#modules)
- [Direction artistique](#direction-artistique)
- [Couche cinématographique WebGL](#couche-cinématographique-webgl)
- [Séquence d'entrée](#séquence-dentrée)
- [Curseur et conception sonore](#curseur-et-conception-sonore)
- [Architecture de performance](#architecture-de-performance)
- [Internationalisation](#internationalisation)
- [Intégration et déploiement continus](#intégration-et-déploiement-continus)
- [Feuille de route](#feuille-de-route)
- [Mentions](#mentions)

---

## Vision

APEX // MOTION est un projet indépendant, non commercial, dédié à la mise en scène
digitale de l'ingénierie Porsche. Le site adopte une esthétique brutaliste-luxe : noir
abyssal, typographie éditoriale surdimensionnée, télémétrie de cockpit épinglée aux
angles, et une caméra 3D à ressort qui répond à chaque interaction. L'objectif est
purement contemplatif et technique : aucune logique e-commerce, aucun prix, aucun bouton
d'achat n'existe dans ce projet.

## Stack technique

| Domaine         | Choix                                                                                                                                    | Rôle                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript                                                                    | SPA fluide, routage par modules                                   |
| Style           | [Tailwind CSS v4](https://tailwindcss.com)                                                                                               | Design system utilitaire, thème sombre natif                      |
| Scroll          | [Lenis](https://github.com/darkroomengineering/lenis)                                                                                    | Inertie de scroll fluide et pesée                                 |
| Animation       | [GSAP](https://gsap.com) (ScrollTrigger) + [Framer Motion](https://www.framer.com/motion)                                                | Chorégraphies éditoriales et micro-états d'interface              |
| 3D / WebGL      | [Three.js](https://threejs.org) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [drei](https://github.com/pmndrs/drei) | Véhicule procédural, matériaux dynamiques, caméra à ressort       |
| Post-traitement | [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)                                                            | Bloom, aberration chromatique, grain, vignette, tone mapping ACES |
| Audio           | Web Audio API (synthèse temps réel) + [Howler.js](https://howlerjs.com) (réservé aux futurs effets échantillonnés)                       | Sonorités d'échappement, blips d'interface                        |
| Icônes          | [lucide-react](https://lucide.dev)                                                                                                       | Iconographie fine, aucune émoji                                   |
| Qualité         | ESLint, Prettier, TypeScript strict, smoke test Playwright                                                                               | Portes de qualité en intégration continue                         |

## Architecture du projet

```
apex-motion/
├── .github/
│   ├── workflows/ci.yml         # Types, lint, format, build, smoke test
│   ├── workflows/deploy.yml     # Déploiement Vercel en production
│   └── dependabot.yml           # Mises à jour groupées des dépendances
├── app/                         # Routes App Router (SPA à modules)
│   ├── layout.tsx               # Providers, grain, curseur, HUD, navigation
│   ├── template.tsx             # Transitions de page (Framer Motion)
│   ├── page.tsx                 # Page d'accueil (assemble les sections)
│   ├── configurator/            # Module 01 - Studio de personnalisation 3D
│   ├── heritage/                # Module 03 - Archives héritage
│   └── garage/                  # Module 04 - Garage communautaire
├── components/
│   ├── layout/                  # Navbar, Footer, Preloader, HudFrame, scroll
│   ├── ui/                      # CustomCursor, GlassPanel, TelemetryTag, SectionLabel
│   ├── three/                   # Scène 3D, éclairage animé, caméra, post-traitement
│   ├── configurator/            # Panneau de configuration temps réel
│   └── sections/                # Sections de la page d'accueil
├── hooks/                       # useFPS, useEngineAudio, useUISound, useRenderGate
├── lib/
│   ├── i18n/                    # Dictionnaires FR/EN et provider de langue
│   ├── audio/                   # Provider audio et conception sonore synthétisée
│   ├── intro/                   # État de la séquence d'entrée
│   ├── three/                   # Textures procédurales (carbone, vernis)
│   ├── configurator/            # État et types du configurateur
│   ├── heritage-data.ts         # Données des ères Porsche
│   └── garage-data.ts           # Données des builds communautaires
├── scripts/smoke.mjs            # Test de fumée production (Playwright)
├── public/
│   ├── models/                  # Emplacement réservé aux futurs modèles .glb
│   └── audio/                   # Emplacement réservé aux futurs échantillons
└── utils/                       # Fonctions utilitaires (cn)
```

## Démarrage

Prérequis : Node.js 20 ou supérieur.

```bash
npm install
npm run dev
```

L'application est servie sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande               | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Serveur de développement                            |
| `npm run build`        | Build de production                                 |
| `npm run start`        | Sert le build de production                         |
| `npm run typecheck`    | Vérification TypeScript stricte                     |
| `npm run lint`         | Analyse ESLint                                      |
| `npm run format`       | Formatage Prettier                                  |
| `npm run format:check` | Vérifie le formatage sans modifier                  |
| `npm run test:smoke`   | Test de fumée navigateur sur le build de production |

## Modules

### 01 · Studio de personnalisation (`/configurator`)

Un véhicule multi-parties entièrement procédural, construit avec des primitives R3F
(aucun `.glb` requis à ce stade), réagissant en temps réel :

- **Peinture et finition** : teintes métallisées, mates et Paint to Sample. Le matériau
  interpole en continu vers la cible, la finition se métamorphose au lieu de sauter.
- **Aéro et carrosserie** : aileron, splitter avant et carrosserie élargie. L'élargissement
  s'anime sur l'échelle de la coque, les roues restant à l'écart de cette mise à l'échelle.
- **Jantes et freinage** : plusieurs dessins de jantes, étriers colorés (PCCB jaune, Guards
  Red, noir), avec une impulsion lumineuse émissive à chaque changement.
- **Habitacle** : le pavillon vitré s'efface pour laisser inspecter la cabine, choix
  cuir ou Alcantara, arceau cage optionnel.
- **Chorégraphie de caméra** : chaque onglet redirige un ressort amorti (raideur et
  amortissement réglés pour un glissé lourd) plutôt qu'une coupe. Un léger parallaxe suit
  le pointeur en permanence.

### 02 · Laboratoire sonore (`/#soundbox`)

Un compte-tours interactif de 0 à 9 000 tr/min. Aucune sonorité pré-enregistrée : le
moteur est entièrement synthétisé via l'API Web Audio (oscillateurs désaccordés et bruit
filtré), avec un visualiseur de fréquences en temps réel et trois lignes d'échappement.

### 03 · Héritage (`/heritage`)

Une frise chronologique à défilement horizontal pilotée par GSAP ScrollTrigger, retraçant
sept décennies d'ingénierie flat-6, de la 356 originelle à la 911 GT3 RS moderne.

### 04 · Garage communautaire (`/garage`)

Une grille de configurations partagées par la communauté, avec déclencheurs de rendu 4K
et codes de configuration copiables en un clic.

## Direction artistique

- **Fond** : noir abyssal (`#020202`), surfaces charbon, bordures rasoir (`border-white/10`).
- **Typographie** : titres éditoriaux surdimensionnés et resserrés (`tracking-tighter`),
  fusionnés en `mix-blend-difference` pour s'inverser au passage de la carrosserie.
  Métadonnées de télémétrie minuscules et espacées (`tracking-widest`, `text-[10px]`).
- **HUD** : cadre en filet et blocs de télémétrie épinglés aux quatre angles (FPS, Cx,
  appui, régime, température), à la manière d'un tableau de bord aérospatial.
- **Grain et lignes de balayage** : une turbulence SVG animée et un léger scanline
  recouvrent toute la page pour casser l'aspect « écran plat numérique ».
- **Iconographie** : `lucide-react` exclusivement, aucune émoji.

## Couche cinématographique WebGL

Le pipeline de post-traitement est mutualisé dans `components/three/CinematicEffects.tsx`
et décliné en deux réglages :

- `hero` : bloom appuyé et grain marqué, la scène se lit comme une pellicule.
- `studio` : rendu plus net, pour que les changements de matériaux restent lisibles.

La chaîne enchaîne **Bloom** (débordement des lumières de contour), **aberration
chromatique**, **bruit animé**, **vignette** et **tone mapping ACES Filmic** afin que les
hautes lumières ne saturent pas en blanc plat.

L'éclairage combine trois softbox (`rectAreaLight` : clé, remplissage froid, contre-jour
chaud) et un projecteur qui orbite lentement autour de la voiture, de sorte que les reflets
sur la carrosserie ne sont jamais figés.

### Réalisme des matériaux

Les reflets qui rendent une peinture crédible ne viennent pas des lampes, mais de ce que la
peinture voit. La scène fabrique donc son propre environnement : des bandes émissives
(`Lightformer`) disposées comme un studio photo réel, cuites une seule fois dans une cubemap
de 256 px, sans aucun téléchargement. Ce sont ces bandes qui produisent la traînée lumineuse
caractéristique le long du flanc.

S'y ajoutent, dans `lib/three/textures.ts`, deux cartes générées au chargement dans un canvas
hors écran plutôt que téléchargées :

- une **carte de normales carbone**, tissage sergé 2x2, appliquée aux pièces aéro ;
- une **carte de normales de vernis** de très faible amplitude, qui reproduit la peau
  d'orange d'une vraie laque et empêche la carrosserie de ressembler à du plastique moulé.

Les finitions mates reçoivent un vernis diffus, les finitions brillantes un vernis mouillé,
et la transition entre les deux est interpolée image par image. Les roues possèdent une
véritable inertie de rotation : changer de jante ou d'étrier les lance et les laisse
s'arrêter par amortissement angulaire.

### Force G de la caméra

Au-delà du ressort, deux effets donnent le poids : le champ de vision s'élargit avec la
vitesse, comme l'accélération comprime la perception d'un couloir, et la caméra s'incline
dans les déplacements latéraux comme un châssis penche dans une épingle. Les deux reviennent
au neutre à mesure que le ressort se stabilise.

## Séquence d'entrée

Le préchargeur affiche un compteur au dixième de pourcent, une grille technique dont les
cellules s'allument comme une matrice de capteurs, et les étapes de mise en route. Il
attend réellement `document.fonts.ready` avant d'atteindre 100 %, la barre plafonnant à
92 % tant que les polices ne sont pas décodées.

L'entrée est volontairement un clic. C'est le geste que les navigateurs exigent pour
débloquer l'audio, ce qui permet de faire du démarrage moteur le tout premier son de
l'expérience. Le rideau s'ouvre alors en deux moitiés et l'animation du Hero est libérée sur
le même temps, de sorte que les deux mouvements n'en forment qu'un.

## Curseur et conception sonore

Le curseur natif est remplacé par un anneau creux qui interpole vers le pointeur, se dilate
et s'aimante vers tout élément portant l'attribut `data-cursor`, dont il affiche le libellé
contextuel. Tout le travail par image est fait en mutation DOM directe : React ne se
re-rend jamais sur un déplacement de souris. Le curseur est désactivé sur les pointeurs
grossiers (tactile).

`lib/audio/soundDesign.ts` synthétise toutes les réponses tactiles à la volée, sans aucun
fichier audio dans le bundle. Un clic métallique est construit sur des partiels
inharmoniques au-dessus d'un souffle filtré, car c'est l'inharmonicité qui fait entendre du
métal plutôt que du bois. L'engagement lourd (`shift`) superpose un frottement mécanique et
un coup sourd amorti. Le démarrage enchaîne quelques impulsions de démarreur avant la
descente résonante en sous-graves. Un compresseur en sortie évite que des sons empilés ne
saturent.

## Architecture de performance

- **Rendu conditionné à la visibilité** : `hooks/useRenderGate.ts` combine un
  `IntersectionObserver` et l'état de visibilité de l'onglet. Une scène hors écran passe en
  `frameloop="never"`, donc à zéro travail GPU, au lieu de calculer des images que personne
  ne regarde.
- **Résolution adaptative** : `PerformanceMonitor` abaisse le plafond de `dpr` quand la
  cadence faiblit et le relève quand elle revient, ce qui préserve la fluidité plutôt que la
  définition.
- **Une seule boucle rAF pour le défilement** : GSAP pilote Lenis, au lieu de deux boucles
  concurrentes. C'est la source habituelle de saccades sur les animations liées au scroll,
  supprimée par construction.
- **HUD sans re-rendu** : le tableau de bord écrit directement dans le DOM depuis une boucle
  unique, un affichage rafraîchi soixante fois par seconde ne coûte donc rien à React.
- **Mouvement réduit respecté** : `prefers-reduced-motion` désactive l'interpolation de
  défilement, le grain animé et le rideau d'entrée.

## Internationalisation

Le projet est conçu multilingue dès l'origine (`lib/i18n`). Le français est la langue par
défaut ; l'anglais est déjà disponible via le sélecteur de langue dans la navigation.
Ajouter une langue consiste à étendre `dictionaries.ts` avec un nouveau bloc de
traductions typées.

## Intégration et déploiement continus

**`ci.yml`** se déclenche sur chaque push et pull request vers `main` :

1. **Qualité** : `typecheck`, `lint`, `format:check`.
2. **Build** : build de production Next.js, avec cache `.next/cache` réutilisé entre les
   exécutions, puis dépôt de l'artefact.
3. **Test de fumée** : lance le serveur de production et pilote un Chromium sans interface
   sur chaque route, en échouant si une page renvoie une erreur, journalise une erreur
   console, ou rend sans son canvas WebGL.

**`deploy.yml`** déploie sur Vercel à chaque push sur `main`. Le job se met en veille
proprement si le secret `VERCEL_TOKEN` est absent, ce qui laisse les forks fonctionnels.
Secrets attendus : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

**`dependabot.yml`** regroupe les mises à jour hebdomadaires par famille (WebGL, animation,
outillage) pour limiter le bruit de revue.

## Feuille de route

- Remplacement des géométries procédurales par des modèles `.glb` haute fidélité
  (`public/models/`).
- Échantillons audio spatialisés via Howler.js pour les retours d'interface.
- Export de rendus 4K réels depuis le canvas du configurateur.
- Persistance et partage de configurations via code court.

## Mentions

APEX // MOTION est un projet indépendant à but non commercial, non affilié à
Dr. Ing. h.c. F. Porsche AG. Tous les noms de modèles sont cités à titre de référence
uniquement, dans un cadre éditorial et non lucratif.
