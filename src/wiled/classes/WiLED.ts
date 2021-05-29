import { Gpio } from 'pigpio';
import { Color } from '../../util/Color.class';
import { HSL, RGB } from '../../util/Types.types';
import { WiLEDConstructor } from '../types/WiLED.types';

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

  constructor({
    frequency = 50,
    pins = { r: 13, g: 19, b: 12 },
  }: WiLEDConstructor) {
    this.frequency = frequency;
    this.pins = pins;
    this.init();
  }

  /**
   * Change current color
   */

  public set setColor(color: Color) {
    this._color = color;
  }

  /**
   * Get current color
   */

  public get color(): Color {
    return this._color;
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

        const hsl: HSL = this._color.hsl;
        this._color = new Color({ ...hsl, h: hsl.h + 1 > 360 ? 0 : hsl.h + 1 });
      }
    }, /* 1000 / this.frequency */ 250);
  }

  /**
   * Function to stop the update interval and turn
   *
   * the leds off
   *
   * @returns void
   */

  public stop(): void {
    this._running = false;
    clearInterval(this._interval);
    this._rPin.pwmWrite(0);
    this._gPin.pwmWrite(0);
    this._bPin.pwmWrite(0);
  }
}
