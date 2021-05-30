import { HSL, RGB } from './Types.types';

export class Color {
  /**
   * Hex value of the color without the #
   *
   * @example fcba03
   */

  public hex: string;

  /**
   * RGB value of the color
   */

  public rgb: RGB;

  /**
   * HSL value of the color
   */

  public hsl: HSL;

  constructor(color: string | RGB | HSL) {
    if (
      typeof color === 'string' &&
      color.match(/^#?(?:[0-9a-fA-F]{3}){1,2}$/)
    ) {
      this.hex = color.startsWith('#') ? color.substr(1) : color;
      this.rgb = Color.toRGB(this.hex) as any;
      this.hsl = Color.toHSL(this.rgb) as any;
    } else if (Object.keys(color).includes('r')) {
      this.rgb = color as RGB;
      this.hex = Color.toHex(this.rgb);
      this.hsl = Color.toHSL(this.hex) as any;
    } else {
      this.hsl = color as HSL;
      this.hex = Color.toHex(this.hsl);
      this.rgb = Color.toRGB(this.hex) as any;
    }
  }

  /**
   * Converts hex or hsl to rgb
   *
   * @param color color of type hex or hsl
   *
   * @returns RGB | null
   */

  public static toRGB(color: string | HSL): RGB | null {
    if (typeof color === 'string') {
      if (!color.match(/^#?(?:[0-9a-fA-F]{3}){1,2}$/)) return null;
      const result: any = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
        color,
      );
      if (!result) return null;
      return {
        r: Math.round(parseInt(result[1], 16)),
        g: Math.round(parseInt(result[2], 16)),
        b: Math.round(parseInt(result[3], 16)),
      };
    } else {
      let { h, s, l } = color;
      h /= 360;
      s /= 100;
      l /= 100;
      let r, g, b;

      if (s == 0) r = g = b = l;
      else {
        function toRGB(p: number, q: number, t: number) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return Math.round(p * 255);
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = toRGB(p, q, h + 1 / 3);
        g = toRGB(p, q, h);
        b = toRGB(p, q, h - 1 / 3);
      }
      return { r: r, g: g, b: b };
    }
  }

  /**
   * Converts rgb or hex to hsl
   *
   * @param color color of type rgb or hex
   *
   * @returns HSL | null
   */

  public static toHSL(color: RGB | string): HSL | null {
    if (typeof color === 'string') {
      if (!color.match(/^#?(?:[0-9a-fA-F]{3}){1,2}$/)) return null;
    }
    let { r, g, b } =
      typeof color === 'string' ? (this.toRGB(color) as any) : color;
    (r /= 255), (g /= 255), (b /= 255);
    const max: number = Math.max(r, g, b);
    const min: number = Math.min(r, g, b);

    let h: number = 0;
    let s: number = 0;
    let l: number = (max + min) / 2;

    if (max == min) h = s = 0;
    else {
      const d: number = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Converts rgb or hsl to hex without #
   *
   * @param color color of type rgb or hsl
   *
   * @returns string
   */

  public static toHex(color: RGB | HSL): string {
    if (Object.keys(color).includes('r')) {
      const { r, g, b } = color as any;
      return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    } else {
      let { h, s, l } = color as any;
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, '0');
      };
      return `${f(0)}${f(8)}${f(4)}`;
    }
  }
}
