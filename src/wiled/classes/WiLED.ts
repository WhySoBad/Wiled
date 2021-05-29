import { Gpio } from 'pigpio';
import { Color } from '../../util/Color.class';
import { RGB } from '../../util/Types.types';
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

  private _color: RGB;

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

  public set setColor(color: RGB) {
    this._color = color;
  }

  /**
   * Get current color
   */

  public get color(): RGB {
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
        this._rPin.pwmWrite(this._color.r);
        this._gPin.pwmWrite(this._color.g);
        this._bPin.pwmWrite(this._color.b);
        this._color = {
          r: this._color.r + 1 > 255 ? 0 : this._color.r + 1,
          g: this._color.g - 1 < 0 ? 255 : this._color.g - 1,
          b: this._color.b + 2 > 255 ? 0 : this._color.b + 2,
        };
        const hex: string = Color.toHex(this._color);
        console.log(Color.toHSL(this._color), hex, Color.toRGB(hex));
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
