import { Gpio } from 'pigpio';
import { Color } from '../../util/Color.class';
import { HSL, RGB } from '../../util/Types.types';
import { ColorOptions, WiLEDConstructor } from '../types/WiLED.types';

export class WiLED {
  /**
   * Interval frequency in Hz [repetitions/second]
   */

  public readonly frequency: number;

  /**
   * Connected RGB GPIO pins
   */

  public readonly pins: RGB;

  private _color: Color;

  private _running: boolean;

  private _interval: NodeJS.Timeout;

  private _rPin: Gpio;

  private _gPin: Gpio;

  private _bPin: Gpio;

  private _pulsating: false | number = false;

  private _adjust: boolean = false;

  private _static: boolean = false;

  private _reverse: boolean = false;

  private _autoReverse: boolean = false;

  private _speed: number;

  //internal variables

  private _baseLight: number;

  private _iteration: number = 0;

  constructor({
    frequency = 50,
    pins = { r: 13, g: 19, b: 12 },
  }: WiLEDConstructor) {
    this.frequency = frequency;
    this.pins = pins;
    this.init();
  }

  /**
   * Change current speed
   *
   * @param speed new speed
   *
   * @returns void
   */

  public setSpeed(speed: number): void {
    this._speed = speed;
  }

  /**
   * Change current color
   *
   * @param color new Color
   *
   * @param options optional options
   *
   * @returns void
   */

  public setColor(color: Color, options?: ColorOptions): void {
    if (options) {
      options = {
        ...{
          mode: this._static
            ? 'STATIC'
            : this._autoReverse
            ? 'AUTOREVERSE'
            : this._reverse
            ? 'REVERSE'
            : 'NORMAL',
          pulsating: this._pulsating && {
            pulse: this._pulsating,
            adjust: this._adjust,
          },
        },
        ...options,
      };
      if (options.mode) {
        this._static = options.mode === 'STATIC';
        this._reverse = options.mode === 'REVERSE';
        this._autoReverse = options.mode === 'AUTOREVERSE';
      }
      if (typeof options.pulsating === 'object') {
        this.setPulsating(options.pulsating.pulse, options.pulsating.adjust);
      } else this.setPulsating(options.pulsating || false, false);
    }
    this._baseLight = color.hsl.l;
    this._color = color;
  }

  /**
   * Change or disable pulse
   *
   * @param pulse new pulse value [value between -50 and 50]
   *
   * @param adjust boolean whether the brightness of the color should be auto-adjusted if the pulse is too high
   *
   * @default false
   *
   * @returns void
   */

  public setPulsating(pulse: false | number, adjust: boolean = false): void {
    if (typeof pulse === 'number' && (pulse > 50 || pulse < -50)) {
      throw new Error('Pulse has to be in range of -50 and 50');
    } else {
      this._pulsating = pulse;
      this._adjust = adjust;
    }
  }

  /**
   * Set whether the leds should have a static color or transition between
   *
   * the rgb spectrum
   *
   * @param enable boolean whether the leds should be static or not
   *
   * @param color new Color [optional]
   */

  public setStatic(enable: boolean, color?: Color): void {
    this._static = enable;
    if (color) this._color = color;
  }

  /**
   * Change whether the transitions run in the
   *
   * reverse rgb direction or not
   *
   * @param enable boolean to enable reverse rgb effect
   *
   * @returns void
   */

  public setReverse(enable: boolean): void {
    this._reverse = enable;
  }

  /**
   * Change whether the direction switches at the end of the rainbow
   *
   * to reverse or not
   *
   * @param enable boolean to enable auto reverse rgb effect
   *
   * @returns void
   */

  public setAutoReverse(enable: boolean): void {
    this._autoReverse = enable;
  }

  /**
   * Speed of the effect [in HSL hue degrees/interval]
   *
   * @default 1
   */

  public get speed(): number {
    return this._speed;
  }

  /**
   * Current color
   */

  public get color(): Color {
    return this._color;
  }

  /**
   * Boolean whether the leds are pulsating
   *
   * @default false
   */

  public get isPulsating(): boolean {
    return !!this._pulsating;
  }

  /**
   * Boolean whether auto brightness adjust of the
   *
   * pulse effect is enabled
   *
   * @default false
   */

  public get doesAutoAdjust(): boolean {
    return this._adjust;
  }

  /**
   * Boolean whether the leds have a static color
   *
   * @default false
   */

  public get isStatic(): boolean {
    return this._static;
  }

  /**
   * Boolean whether the leds transition in reverse rgb direction
   *
   * @default false
   */

  public get isReverse(): boolean {
    return this._reverse;
  }

  /**
   * Boolean whether auto reverse mode is enabled or not
   *
   * @default false
   */

  public get isAutoReverse(): boolean {
    return this._autoReverse;
  }

  /**
   * Boolean whether the interval loop is running
   */

  public get isRunning(): boolean {
    return this._running;
  }

  /**
   * Init function
   *
   * @returns void
   */

  private init(): void {
    //connect GPIO pins

    this._rPin = new Gpio(this.pins.r, { mode: Gpio.OUTPUT });
    this._gPin = new Gpio(this.pins.g, { mode: Gpio.OUTPUT });
    this._bPin = new Gpio(this.pins.b, { mode: Gpio.OUTPUT });

    //init websockets
  }

  /**
   * Function to start the update interval
   *
   * @returns void
   */

  public start(): void {
    this._running = true;
    this._interval = setInterval(() => {
      if (this._running) {
        this._rPin.pwmWrite(this._color.rgb.r);
        this._gPin.pwmWrite(this._color.rgb.g);
        this._bPin.pwmWrite(this._color.rgb.b);
        console.log(this._color.hex, this._color.rgb, this._color.hsl);

        if (this._iteration < this.frequency) this._iteration++;
        else this._iteration = 0;

        if (this._static) return;

        const hsl: HSL = this._color.hsl;

        let h: number = Math.round(
          hsl.h - (this._reverse ? this.speed : -this.speed),
        );

        let s: number = hsl.s;
        let l: number = hsl.l;

        if (h > 360) {
          if (!this._reverse && this._autoReverse) {
            this._reverse = true;
            h = 360;
          } else h = 0;
        } else if (h < 0) {
          if (this._reverse && this._autoReverse) {
            this._reverse = false;
            h = 0;
          } else h = 360;
        }

        if (this._pulsating) {
          const a: number = this._pulsating;
          const b: number = 0.5;
          let d: number = 0;

          if (this._adjust) {
            if (this._baseLight + this._pulsating > 100) {
              d = -(this._baseLight + this._pulsating - 100);
            } else if (this._baseLight - this._pulsating < 0) {
              d = -(this._baseLight - this._pulsating);
            }
          }

          const sin: number = a * Math.sin(b * this._iteration) + d;

          if (l + sin > 100) l = 100;
          else if (l + sin < 0) l = 0;
        }

        this._color = new Color({ h: h, s: s, l: l });
      }
    }, 1000 / this.frequency);
  }

  /**
   * Function to stop the update interval and turn
   *
   * the leds off
   *
   * @param black boolean whether the leds should be turned black or not
   *
   * @default false
   *
   * @returns void
   */

  public stop(black: boolean = false): void {
    this._running = false;
    clearInterval(this._interval);
    if (!black) return;
    this._rPin.pwmWrite(0);
    this._gPin.pwmWrite(0);
    this._bPin.pwmWrite(0);
  }
}
