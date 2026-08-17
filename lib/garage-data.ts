export interface GarageBuild {
  id: string;
  author: string;
  model: string;
  paint: string;
  code: string;
  gradient: string;
}

export const garageBuilds: GarageBuild[] = [
  {
    id: "build-01",
    author: "M. Feldmann",
    model: "GT3 RS",
    paint: "PTS Viper Green",
    code: "APEX-7F3K-RS02",
    gradient: "from-emerald-900 via-neutral-900 to-black",
  },
  {
    id: "build-02",
    author: "S. Laurent",
    model: "Turbo S",
    paint: "Guards Red",
    code: "APEX-2M9X-TS11",
    gradient: "from-red-900 via-neutral-900 to-black",
  },
  {
    id: "build-03",
    author: "K. Nakamura",
    model: "GT3",
    paint: "Racing Yellow",
    code: "APEX-9P1L-GT07",
    gradient: "from-amber-800 via-neutral-900 to-black",
  },
  {
    id: "build-04",
    author: "A. Beaumont",
    model: "Carrera 4S",
    paint: "Shark Blue Mat",
    code: "APEX-4T6R-C4S3",
    gradient: "from-sky-950 via-neutral-900 to-black",
  },
  {
    id: "build-05",
    author: "J. Okafor",
    model: "GT3 RS",
    paint: "Jet Black Mat",
    code: "APEX-8H2W-RS09",
    gradient: "from-neutral-800 via-neutral-900 to-black",
  },
  {
    id: "build-06",
    author: "L. Moreau",
    model: "Turbo S",
    paint: "GT Silver",
    code: "APEX-1Q5D-TS04",
    gradient: "from-zinc-700 via-neutral-900 to-black",
  },
];
