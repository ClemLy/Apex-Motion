<div align="center">

# APEX // MOTION

**Une exploration numerique immersive de l'ingenierie Porsche.**
Studio de personnalisation 3D en temps reel, laboratoire sonore et archives heritage.

Aucun prix. Aucun panier. Uniquement la passion, la precision et le mouvement.

</div>

---

## Sommaire

- [Vision](#vision)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Demarrage](#demarrage)
- [Modules](#modules)
- [Systeme de design](#systeme-de-design)
- [Internationalisation](#internationalisation)
- [Feuille de route](#feuille-de-route)
- [Mentions](#mentions)

---

## Vision

APEX // MOTION est un projet independant, non commercial, dedie a la mise en scene digitale
de l'ingenierie Porsche. Le site adopte une esthetique brutaliste-luxe : noir mat profond,
typographie editoriale surdimensionnee, metadonnees de telemetrie miniatures, et une camera 3D
qui reagit a chaque interaction. L'objectif est purement contemplatif et technique : aucune
logique e-commerce, aucun prix, aucun bouton d'achat n'existe dans ce projet.

## Stack technique

| Domaine | Choix | Role |
| --- | --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript | SPA fluide, routage par modules |
| Style | [Tailwind CSS v4](https://tailwindcss.com) | Design system utilitaire, dark mode natif |
| Scroll | [Lenis](https://github.com/darkroomengineering/lenis) | Inertie de scroll fluide et pesee |
| Animation | [GSAP](https://gsap.com) (ScrollTrigger) + [Framer Motion](https://www.framer.com/motion) | Choregraphies editoriales et micro-etats UI |
| 3D / WebGL | [Three.js](https://threejs.org) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [drei](https://github.com/pmndrs/drei) | Vehicule procedural, materiaux dynamiques, camera choregraphiee |
| Post-traitement | [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) | Bloom, vignette, tone mapping cinematique |
| Audio | Web Audio API (synthese moteur en temps reel) + [Howler.js](https://howlerjs.com) (reserve aux futurs effets sonores echantillonnes) | Sonorites d'echappement synthetisees, retours UI |
| Icones | [lucide-react](https://lucide.dev) | Iconographie fine, aucune emoji |

## Architecture du projet

```
apex-motion/
├── app/                        # Routes App Router (SPA a modules)
│   ├── layout.tsx              # Providers globaux, polices, structure
│   ├── template.tsx            # Transitions de page (Framer Motion)
│   ├── page.tsx                # Page d'accueil (assemble les sections)
│   ├── configurator/           # Module 01 - Studio de personnalisation 3D
│   ├── heritage/                # Module 03 - Archives heritage
│   └── garage/                  # Module 04 - Garage communautaire
├── components/
│   ├── layout/                 # Navbar, Footer, SmoothScrollProvider
│   ├── ui/                     # Primitives visuelles (GlassPanel, TelemetryTag...)
│   ├── three/                  # Scene 3D : Studio, modele procedural, camera, canvas
│   ├── configurator/           # Panneau de configuration (peinture, aero, jantes, interieur)
│   └── sections/                # Sections de la page d'accueil (Hero, Soundbox, Heritage...)
├── hooks/                       # useFPS, useEngineAudio
├── lib/
│   ├── i18n/                   # Dictionnaires FR/EN et provider de langue
│   ├── audio/                  # Provider audio global (activation, AudioContext)
│   ├── configurator/           # Etat et types du configurateur (contexte React)
│   ├── heritage-data.ts        # Donnees des eres Porsche
│   └── garage-data.ts          # Donnees des builds communautaires
├── public/
│   ├── models/                 # Emplacement reserve aux futurs modeles .glb
│   └── audio/                  # Emplacement reserve aux futurs echantillons audio
└── utils/                       # Fonctions utilitaires (cn)
```

## Demarrage

Prerequis : Node.js 20 ou superieur.

```bash
npm install
npm run dev
```

L'application est servie sur [http://localhost:3000](http://localhost:3000).

Autres commandes :

```bash
npm run build   # build de production
npm run start   # sert le build de production
npm run lint    # verification ESLint
```

## Modules

### 01 · Studio de personnalisation (`/configurator`)

Un vehicule multi-parties entierement procedural, construit avec des primitives R3F (aucun
`.glb` requis a ce stade), reagissant en temps reel :

- **Peinture et finition** : teintes metallisees, mates et Paint to Sample, avec ajustement
  live de la rugosite, du metalness et du vernis (`meshPhysicalMaterial`).
- **Aero et carrosserie** : aileron, splitter avant et carrosserie elargie, ajoutes ou retires
  dynamiquement.
- **Jantes et freinage** : plusieurs dessins de jantes, etriers colores (PCCB jaune, Guards
  Red, noir).
- **Habitacle** : inspection de la cabine, choix cuir/Alcantara, arceau cage optionnel.
- **Choregraphie de camera** : la camera se deplace en douceur (lerp amorti) entre des
  presets (exterieur, arriere, jantes, cabine) selon l'onglet actif.

### 02 · Laboratoire sonore (`/#soundbox`)

Un compte-tours interactif de 0 a 9 000 tr/min. Aucune sonorite pre-enregistree : le moteur
est entierement synthetise via l'API Web Audio (oscillateurs detunes + bruit filtre), avec
un visualiseur de frequences en temps reel et trois lignes d'echappement (origine
constructeur, titane course, ligne directe).

### 03 · Heritage (`/heritage`)

Une frise chronologique a defilement horizontal pilotee par GSAP ScrollTrigger, retracant
sept decennies d'ingenierie flat-6, de la 356 originelle a la 911 GT3 RS moderne.

### 04 · Garage communautaire (`/garage`)

Une grille de configurations partagees par la communaute, avec declencheurs de rendu 4K et
codes de configuration copiables en un clic.

## Systeme de design

- **Fond** : noir mat profond (`#030303`), surfaces charbon, bordures rasoir
  (`border-white/10`).
- **Typographie** : titres editoriaux surdimensionnes et resserres (`tracking-tighter`),
  metadonnees de telemetrie minuscules et espacees (`tracking-widest`, `text-[10px]`).
- **Navigation** : pilule flottante en glassmorphism (`backdrop-blur-2xl`,
  `bg-neutral-950/70`), indicateur FPS live, bascule audio spatial.
- **Iconographie** : `lucide-react` exclusivement, aucune emoji.

## Internationalisation

Le projet est concu multilingue des l'origine (`lib/i18n`). Le francais est la langue par
defaut ; l'anglais est deja disponible via le selecteur de langue dans la navigation. Ajouter
une langue consiste a etendre `dictionaries.ts` avec un nouveau bloc de traductions typees.

## Feuille de route

- Remplacement des geometries procedurales par des modeles `.glb` haute fidelite
  (`public/models/`).
- Echantillons audio spatialises via Howler.js pour les retours d'interface.
- Export de rendus 4K reels depuis le canvas du configurateur.
- Persistance et partage de configurations via code court.

## Mentions

APEX // MOTION est un projet independant a but non commercial, non affilie a
Dr. Ing. h.c. F. Porsche AG. Tous les noms de modeles sont cites a titre reference
uniquement, dans un cadre editorial et non lucratif.
