import { RGB } from "../util/Types.types";

export interface WiledConstructor {
  /**
   * Interval frequency in Hz [repetitions/second]
   *
   * @default 50
   */

  frequency?: number;

  /**
   * RGB GPIO pins which are connected
   *
   * @default { r: 13, g: 19, b: 12 }
   *
   */

  pins?: RGB;

  /**
   * Enable log outputs
   *
   * @default true
   */

  log?: boolean;

  /**
   * Start local server
   *
   * @default false
   */

  server?: boolean | { port: number };
}

export type EffectMode = "STATIC" | "REVERSE" | "AUTOREVERSE" | "NORMAL";

export interface ColorOptions {
  /**
   * Mode of the effect
   *
   * @default "NORMAL"
   */

  mode?: EffectMode;

  /**
   * Whether the color should pulse or not
   *
   * @default false
   */

  pulsating?: false | number | { pulse: number; adjust: boolean };
}
