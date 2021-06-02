import { Gpio } from "pigpio";
import { Server } from "../server/Server.class";
import { Color } from "../util/Color.class";
import { Logger } from "../util/Logger.class";
import { HSL, RGB } from "../util/Types.types";
import { ColorOptions, EffectMode, WiledConstructor } from "./Wiled.types";

/**
 * Wiled class
 *
 * @constructor WiledConstructor
 */

export class Wiled {
  /**
   * Interval frequency in Hz [repetitions/second]
   */

  public readonly frequency: number;

  /**
   * Connected RGB GPIO pins
   */

  public readonly pins: RGB;

  private _color: Color = new Color("#000000");

  private _log: boolean;

  private _running: boolean;

  private _interval: NodeJS.Timeout;

  private _rPin: Gpio;

  private _gPin: Gpio;

  private _bPin: Gpio;

  private _pulsating: false | number = false;

  private _pulseSpeed: number = 0.15;

  private _adjust: boolean = false;

  private _static: boolean = false;

  private _reverse: boolean = false;

  private _autoReverse: boolean = false;

  private _speed: number = 1;

  //internal variables

  private _baseLight: number;

  private _iteration: number = 0;

  private _tempHue: number = 0;

  private _server: Server;

  constructor({ frequency = 50, pins = { r: 13, g: 19, b: 12 }, log = true, server = false }: WiledConstructor) {
    this.frequency = frequency;
    this.pins = pins;
    this._log = log;
    if (server) {
      if (typeof server === "object") this._server = new Server(this, { port: server.port });
      else this._server = new Server(this);
    }
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
    this.log(`Speed set to ${speed}`);
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
          mode: this._static ? "STATIC" : this._autoReverse ? "AUTOREVERSE" : this._reverse ? "REVERSE" : "NORMAL",
          pulsating: this._pulsating && {
            pulse: this._pulsating,
            adjust: this._adjust,
          },
        },
        ...options,
      };
      if (options.mode) this.setMode(options.mode);
      if (typeof options.pulsating === "object") {
        this.setPulsating(options.pulsating.pulse, options.pulsating.adjust);
      } else this.setPulsating(options.pulsating || false, false);
    }
    this._baseLight = color.hsl.l;
    this._iteration = 0;
    this._tempHue = 0;
    this._color = color;
    this.log(`Color set to`, color.rgb);
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
    if (typeof pulse === "number" && (pulse > 50 || pulse < -50)) {
      throw new Error("Pulse has to be in range of -50 and 50");
    } else {
      this._pulsating = pulse;
      this._adjust = adjust;
      if (this._pulsating) this.log(`Pulse set to ${pulse}`);
      else this.log("Disabled pulse");
    }
  }

  /**
   * Change speed of the pulse effect
   *
   * @param speed new speed
   *
   * @returns void
   */

  public setPulseSpeed(speed: number): void {
    if (this._pulseSpeed === speed) return;
    this._pulseSpeed = speed;
    this.log(`Pulse speed set to ${speed}`);
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
    if (this._static === enable) return;
    this._static = enable;
    this.log(`${enable ? "Enabled" : "Disabled"} static mode`);
    if (color) this.setColor(color);
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
    if (this._reverse === enable && !this._autoReverse) return;
    this.setAutoReverse(false);
    this._reverse = enable;
    this.log(`${enable ? "Enabled" : "Disabled"} reverse mode`);
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
    if (this._autoReverse === enable) return;
    this._autoReverse = enable;
    this.log(`${enable ? "Enabled" : "Disabled"} auto reverse mode`);
  }

  /**
   * Change current mode
   *
   * @param mode new mode
   *
   * @returns void
   */

  public setMode(mode: EffectMode): void {
    this.setStatic(mode === "STATIC");
    this.setReverse(mode === "REVERSE");
    this.setAutoReverse(mode === "AUTOREVERSE");
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
   * Speed of the pulse effect
   *
   * @default 1.5
   */

  public get pulseSpeed(): number {
    return this._pulseSpeed;
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
   * Current mode
   */

  public get mode(): EffectMode {
    if (this._static) return "STATIC";
    else if (this._autoReverse) return "AUTOREVERSE";
    else if (this._reverse) return "REVERSE";
    else return "NORMAL";
  }

  /**
   * Current pulse amplitude
   */

  public get pulseAmplitude(): number | null {
    return this._pulsating || null;
  }

  /**
   * Boolean whether logs are enabled or not
   */

  public get logsEnabled(): boolean {
    return this._log;
  }

  /**
   * Short function to turn the lights off
   *
   * Sets the color to black
   *
   * @returns void
   */

  public off(): void {
    this.setColor(new Color("#000000"));
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

    this.log("Initialized WiLED");

    this.start();
  }

  /**
   * Internal info logger
   *
   * @param args message
   *
   * @returns void
   */

  private log(...args: Array<any>): void {
    if (this._log) Logger.Info(...args);
  }

  /**
   * Function to start the update interval
   *
   * @returns void
   */

  private start(): void {
    this.log("Started update interval");
    this._running = true;
    this._interval = setInterval(() => {
      if (this._running) {
        this._rPin.pwmWrite(this._color.rgb.r);
        this._gPin.pwmWrite(this._color.rgb.g);
        this._bPin.pwmWrite(this._color.rgb.b);

        if (this._iteration < Math.ceil((2 * Math.PI) / this._pulseSpeed)) {
          this._iteration++;
        } else this._iteration = 0;

        if (this._static && !this._pulsating) return;

        const hsl: HSL = this._color.hsl;

        if (Math.round(this.speed) === 0) this._tempHue += this._speed;

        let h: number = this._reverse ? Math.floor(hsl.h + this._tempHue) : Math.ceil(hsl.h - this._tempHue);

        if (this._tempHue >= 1) this._tempHue -= 1;

        let s: number = hsl.s;
        let l: number = this._baseLight;

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
          const b: number = this._pulseSpeed;
          let d: number = 0;

          if (this._adjust) {
            if (this._baseLight + this._pulsating > 100) {
              d = -(this._baseLight + this._pulsating - 100);
            } else if (this._baseLight - this._pulsating < 0) {
              d = -(this._baseLight - this._pulsating);
            }
          }

          const sin: number = Math.round(a * Math.sin(b * this._iteration) + d);

          if (l + sin > 100) l = 100;
          else if (l + sin < 0) l = 0;
          else l += sin;
        }

        this._color = new Color({
          h: this._static ? hsl.h : Math.abs(h),
          s: s,
          l: l,
        });
      }
    }, 1000 / this.frequency);
  }
}
