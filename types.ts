
export enum BeatState {
  Off,
  Normal,
  Accent,
}

export type Pattern = BeatState[];

export interface Preset {
  name: string;
  pattern: Pattern;
}
