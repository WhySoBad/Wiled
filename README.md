# Wiled
A nodejs package to control LEDs on gpio pins with simple http requests

## Documentation

### Setup

```typescript
const Wiled: Wiled = new Wiled();
```

The Wiled class allows an optional [WiledConstructor](https://github.com/WhySoBad/Wiled#WiledConstructor) object

### Speed 

The default speed of the LEDs is 1 hue from the hsl spectrum per repetition defined in the frequency 

```typescript
wiled.speed //getter for the current speed
```

```typescript
wiled.setSpeed(0.15); //set a new speed which represents an amount of hue added to the current color per repetition
```

### Color

The default color of the LEDs is black (#000000)

```typescript
wiled.color //getter for the current color (returns a Color instance)
```

```typescript
wiled.setColor(new Color("#eb4034")); //set a new color 
```

The setColor method accepts an optional [ColorOptions](https://github.com/WhySoBad/Wiled#ColorOptions) object as parameter to adjust the mode 

### Pulsating

Wiled supports a default pulse effect which is turned off by default 

The pulse effect is a sinus wave with the amplitude of the pulsating value

```typescript
wiled.isPulsating //getter whether the LEDs are pulsating 
 ```

```typescript 
wiled.setPulsating(10); //enables pulsating and sets the pulse amplitude to 10 hue 
wiled.setPulsating(false); //disables pulsating
```

The setPulsating method allows an optional adjust boolean as parameter which defines whether the amplitude should be adjusted automatically to the current l-value of the color to prevent an unsmooth animation

#### PulseSpeed

The pulse speed is a number representig how fast the sinus curve is moving 

```typescript
wiled.pulseSpeed //getter for the current pulse speed
```

```typescript
wiled.setPulseSpeed(10); //sets pulse speed to 10
```

### Modes

The LEDs do have by default some effects which have different parameters

```typescript
wiled.mode //getter for the current mode (returns EffectMode)
```

```typescript
wiled.setMode("NORMAL"); //change the mode; Shorthand function to set any mode
```

#### Static

The static mode doesn't have any effect at all. It's just a static color

```typescript
wiled.isStatic //getter whether the current mode is static
```

```typescript
wiled.setStatic(true) //enable or disable static mode
```

The setStatic method accepts a optional [Color](https://github.com/WhySoBad/Wiled#Color) instance as parameter

#### Reverse

The reverse mode changes the direction of the RGB wave [from red to purple]

```typescript
wiled.isReverse //getter whether the leds run in reverse mode
```

```typescript
wiled.setReverse(true) //enable or disable reverse mode
```

#### Autoreverse

The autoreverse mode changes constantly between reverse and not reverse

When the color arrives from purple to red it enables reverse mode until the color is at purple again

Note: The autoreverse mode uses the external accessible reverse variable [wiled.isReverse isn't always reverse mode]

```typescript
wiled.isAutoReverse //getter whether the current mode is autoreverse
```

```typescript
wiled.setAutoReverse(true) //enable or disable reverse mode
```

## API

### Current state
> Endpoint to get an overview of the current states

```http
GET /
```

#### Response

```typescript
{
  speed: number,
  pulseSpeed: number,
  mode: EffectMode,
  pulsating: boolean,
  pulseAmplitude: number,
  color: {
    rgb: RGB,
    hex: string,
    hsl: HSL,
  }
}
```

### Turn off 
> Endpoint to turn the LEDs off

```http
GET /off
```

#### Errors
```http
409 Leds are already turned off
```

### Turn on
> Endpoint to turn the LEDs back on

```http
GET /continue
```

#### Errors
```http
409 Leds are already turned on
```

### Switch mode
> Endpoint to switch the mode

```http
POST /mode
```
#### Body

```typescript
{
  mode: EffectMode,
}
```

#### Errors
```http
400 Missing mode
```

```http
400 Invalid mode [AUTOREVERSE, NORMAL, REVERSE, STATIC]
```

### Change speed
> Endpoint to change the speed of the rainbow effect

```http
POST /speed
```
#### Body

```typescript
{
  speed: number,
}
```

#### Errors
```http
400 Missing speed
```

```http
400 Speed has to be of type number
```

### Change pulse speed
> Endpoint to change the pulse speed

```http
POST /pulsespeed
```
#### Body

```typescript
{
  speed: number,
}
```

#### Errors

```http
400 Missing speed
```

```http
400 Speed has to be of type number
```

### Change color
> Endpoint to change the color

```http
POST /color
```
#### Body

```typescript
{
  color: string | RGB | HSL,
}
```

#### Errors
```http
400 Missing color
```

```http
400 Invalid hex color
```

```http
400 RGB values have to be of type number
```

```http
400 RGB values have to be within 0 and 255
```

```http
400 HSL values have to be of type number
```

```http
400 HSL values have to be within 0 and 360 [H] or withing 0 and 100 [S, L]
```

```http
400 Invalid color object [RGB/HSL]
```

```http
400 Invalid color
```

### Change pulse amplitude
> Endpoint to change the pulse amplitude [0 = off]

```http
POST /amplitude
```
#### Body

```typescript
{
  amplitude: number,
}
```

#### Errors
```http
400 Missing amplitude
```

```http
400 Amplitude has to be of type number
```

```http
400 Amplitude must be withing 50 and -50
```

## Types

### [Wiled](https://github.com/WhySoBad/Wiled/blob/0c2dc2e6037f833f9c6f7bb34994ae84383fcf46/src/wiled/Wiled.types.ts)

#### [WiledConstructor](https://github.com/WhySoBad/Wiled/blob/0c2dc2e6037f833f9c6f7bb34994ae84383fcf46/src/wiled/Wiled.types.ts#L3)

```typescript 
interface WiledConstructor {
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
```

#### [ColorOptions](https://github.com/WhySoBad/Wiled/blob/0c2dc2e6037f833f9c6f7bb34994ae84383fcf46/src/wiled/Wiled.types.ts#L40)

```typescript
interface ColorOptions {
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
```

### [EffectMode](https://github.com/WhySoBad/Wiled/blob/0c2dc2e6037f833f9c6f7bb34994ae84383fcf46/src/wiled/Wiled.types.ts#L38)

```typescript
type EffectMode = "STATIC" | "REVERSE" | "AUTOREVERSE" | "NORMAL";
```

### [Color](https://github.com/WhySoBad/Wiled/blob/master/src/util/Types.types.ts)

#### [RGB](https://github.com/WhySoBad/Wiled/blob/master/src/util/Types.types.ts#L1)

```typescript
interface RGB {
  r: number;
  g: number;
  b: number;
}
```

#### [HSL](https://github.com/WhySoBad/Wiled/blob/master/src/util/Types.types.ts#L7)

```typescript
interface HSL {
  h: number;
  s: number;
  l: number;
}
```

