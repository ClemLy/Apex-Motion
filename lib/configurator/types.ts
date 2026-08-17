export type PaintFinish = "metallic" | "matte" | "pts";

export interface PaintOption {
  id: string;
  label: string;
  finish: PaintFinish;
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
}

export type WheelId = "turbo-twist" | "carrera-classic" | "gt-center-lock";
export type CaliperColor = "pccb" | "guards-red" | "black";

export type CameraFocus = "exterior" | "rear" | "wheels" | "cabin";

export interface ConfiguratorState {
  paintId: string;
  wing: boolean;
  splitter: boolean;
  widebody: boolean;
  wheelId: WheelId;
  caliperColor: CaliperColor;
  interiorTrim: "leather" | "alcantara";
  rollCage: boolean;
  cabinView: boolean;
  focus: CameraFocus;
}

export const defaultConfiguratorState: ConfiguratorState = {
  paintId: "gt-silver",
  wing: false,
  splitter: false,
  widebody: false,
  wheelId: "turbo-twist",
  caliperColor: "black",
  interiorTrim: "leather",
  rollCage: false,
  cabinView: false,
  focus: "exterior",
};

export const paintOptions: PaintOption[] = [
  {
    id: "gt-silver",
    label: "GT Silver",
    finish: "metallic",
    color: "#c9cdd1",
    roughness: 0.25,
    metalness: 0.9,
    clearcoat: 1,
  },
  {
    id: "guards-red",
    label: "Guards Red",
    finish: "metallic",
    color: "#a8121a",
    roughness: 0.2,
    metalness: 0.7,
    clearcoat: 1,
  },
  {
    id: "racing-yellow",
    label: "Racing Yellow",
    finish: "metallic",
    color: "#e8b900",
    roughness: 0.22,
    metalness: 0.7,
    clearcoat: 1,
  },
  {
    id: "jet-black-matte",
    label: "Jet Black Mat",
    finish: "matte",
    color: "#0a0a0a",
    roughness: 0.85,
    metalness: 0.2,
    clearcoat: 0,
  },
  {
    id: "shark-blue-matte",
    label: "Shark Blue Mat",
    finish: "matte",
    color: "#0f3f52",
    roughness: 0.8,
    metalness: 0.25,
    clearcoat: 0,
  },
  {
    id: "pts-viper-green",
    label: "PTS Viper Green",
    finish: "pts",
    color: "#3c6b1f",
    roughness: 0.18,
    metalness: 0.85,
    clearcoat: 1,
  },
];

export const wheelOptions: { id: WheelId; label: string }[] = [
  { id: "turbo-twist", label: "Turbo Twist" },
  { id: "carrera-classic", label: "Carrera Classic" },
  { id: "gt-center-lock", label: "GT Center-Lock" },
];

export const caliperColors: Record<CaliperColor, string> = {
  pccb: "#f2c200",
  "guards-red": "#a8121a",
  black: "#111111",
};
