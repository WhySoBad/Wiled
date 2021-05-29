import { RGB } from '../../util/Types.types';

export interface WiLEDConstructor {
  /**
   * Interval frequency in Hz [repetitions/second]
   *
   * @default 50
   */

  frequency?: number;

  /**
   * RGB GPIO pins which are connected
   *
   * @default { r: 1, g: 1, b: 1 }
   *
   */

  pins?: RGB;
}
