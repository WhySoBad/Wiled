import { ServerConstructor } from "./Server.types";
import express, { Request, Response } from "express";
import { EventEmitter } from "events";
import { Wiled } from "../wiled/Wiled.class";
import { Color } from "../util/Color.class";
import { EffectMode } from "../wiled/Wiled.types";
import { Logger } from "../util/Logger.class";

export class Server extends EventEmitter {
  private _wiled: Wiled;

  private _app;

  constructor(wiled: Wiled, { port }: ServerConstructor = { port: 3001 }) {
    super();
    this._wiled = wiled;
    this._app = express();

    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));

    this._app.get("/", (request: Request, response: Response) => {
      const color: Color = this._wiled.color;
      response.send({
        speed: this._wiled.speed,
        pulseSpeed: this._wiled.pulseSpeed,
        mode: this._wiled.mode,
        pulsating: this._wiled.isPulsating,
        pulseAmplitude: this._wiled.pulseAmplitude,
        color: {
          rgb: color.rgb,
          hex: color.hex,
          hsl: color.hsl,
        },
      });
    });

    this._app.get("/off", (request: Request, response: Response) => {
      if (this._wiled.isRunning) {
        this._wiled.off();
        response.send();
      } else response.status(409).send({ message: "Leds are already turned off" });
    });

    this._app.get("/continue", (request: Request, response: Response) => {
      if (!this._wiled.isRunning) {
        this._wiled.continue();
        response.send();
      } else response.status(409).send({ message: "Leds are already turned on" });
    });

    this._app.post("/mode", (request: Request, response: Response) => {
      const body = request.body;
      const mode: EffectMode = body.mode;
      if (mode === undefined) response.status(400).send({ message: "Missing mode" });
      else if (mode !== "AUTOREVERSE" && mode !== "NORMAL" && mode !== "REVERSE" && mode !== "STATIC") {
        response.status(400).send({ message: "Invalid mode [AUTOREVERSE, NORMAL, REVERSE, STATIC]" });
      } else {
        this._wiled.setMode(mode);
        response.send();
      }
    });

    this._app.post("/speed", (request: Request, response: Response) => {
      const body = request.body;
      const speed: number = body.speed;
      if (speed === undefined) response.status(400).send({ message: "Missing speed" });
      else if (typeof speed !== "number") response.status(400).send({ message: "Speed has to be of type number" });
      else {
        this._wiled.setSpeed(speed);
        response.send();
      }
    });

    this._app.post("/pulsespeed", (request: Request, response: Response): void => {
      const body = request.body;
      const speed: number = body.speed;
      if (speed === undefined) response.status(400).send({ message: "Missing speed" });
      else if (typeof speed !== "number") response.status(400).send({ message: "Speed has to be of type number" });
      else {
        this._wiled.setPulseSpeed(speed);
        response.send();
      }
    });

    this._app.post("/color", (request: Request, response: Response) => {
      const body = request.body;
      const color = body.color;

      if (color === undefined) response.status(400).send({ message: "Missing color" });
      else if (typeof color === "string") {
        if (!color.match(/^#?(?:[0-9a-fA-F]{3}){1,2}$/)) response.status(400).send({ message: "Invalid hex color" });
        else {
          this._wiled.setColor(new Color(color));
          response.send();
        }
      } else if (typeof color === "object") {
        const keys: Array<string> = Object.keys(color);
        if (keys.includes("r") && keys.includes("g") && keys.includes("b")) {
          const { r, g, b } = color;
          if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") {
            response.status(400).send({ message: "RGB values have to be of type number" });
          } else if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || g > 255) {
            response.status(400).send({ message: "RGB values have to be within 0 and 255" });
          } else {
            this._wiled.setColor(new Color({ r: r, g: g, b: b }));
            response.send();
          }
        } else if (keys.includes("h") && keys.includes("s") && keys.includes("l")) {
          const { h, s, l } = color;
          if (typeof h !== "number" || typeof s !== "number" || typeof l !== "number") {
            response.status(400).send({ message: "HSL values have to be of type number" });
          } else if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
            response.status(400).send({ message: "HSL values have to be within 0 and 360 [H] or withing 0 and 100 [S, L]" });
          } else {
            this._wiled.setColor(new Color({ h: h, s: s, l: l }));
            response.send();
          }
        } else response.status(400).send({ message: "Invalid color object [HSL/RGB]" });
      } else response.status(400).send({ message: "Invalid color" });
    });

    this._app.post("/amplitude", (request: Request, response: Response) => {
      const body = request.body;
      const amplitude: number = body.amplitude;
      if (amplitude === undefined) response.status(400).send({ message: "Missing amplitude" });
      else if (typeof amplitude !== "number") response.status(400).send({ message: "Amplitude has to be of type number" });
      else if (amplitude > 50 || amplitude < -50) response.status(400).send({ message: "Amplitude must be withing 50 and -50" });
      else {
        this._wiled.setPulsating(amplitude, true);
        response.send();
      }
    });

    this._app.listen(port, () => {
      this._wiled.logsEnabled && Logger.Info(`Server started on port ${port}`);
    });
  }

  /**
   * Add custom get request
   *
   * @param path path of the request [e.g. /mode]
   *
   * @param handler handler for the request
   *
   * @returns void
   */

  public get(path: string, handler: (request: Request, response: Response) => void): void {
    this._app.get(path, handler);
  }

  /**
   * Add custom post request
   *
   * @param path path of the request [e.g. /mode]
   *
   * @param handler handler for the request
   *
   * @returns void
   */

  public post(path: string, handler: (request: Request, response: Response) => void): void {
    this._app.post(path, handler);
  }
}
