import rpio from 'rpio';
import pigpio, { Gpio } from 'pigpio';
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
    pins = { r: 12, g: 13, b: 19 },
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

    /*     rpio.init({
      gpiomem: false,
    });

    rpio.open(this.pins.r, rpio.PWM);
    rpio.open(this.pins.g, rpio.PWM);
    rpio.open(this.pins.b, rpio.PWM);
    rpio.pwmSetClockDivider(8);
    rpio.pwmSetRange(this.pins.r, 255);
    rpio.pwmSetRange(this.pins.g, 255);
    rpio.pwmSetRange(this.pins.b, 255);
    rpio.pwmSetData(this.pins.r, 0);
    rpio.pwmSetData(this.pins.g, 0);
    rpio.pwmSetData(this.pins.b, 0); */

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
        /* rpio.pwmSetData(this.pins.r, this._color.r);
        rpio.pwmSetData(this.pins.g, this._color.g);
        rpio.pwmSetData(this.pins.b, this._color.b); */
      }
    }, 1000 / this.frequency);
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
    /* rpio.pwmSetData(this.pins.r, 0);
    rpio.pwmSetData(this.pins.g, 0);
    rpio.pwmSetData(this.pins.b, 0); */
  }
}
