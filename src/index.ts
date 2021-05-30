import { Color } from './util/Color.class';
import { WiLED } from './wiled/classes/WiLED';

const led = new WiLED({
  frequency: 60,
});

led.setSpeed(0.25);

led.start();

led.setColor(new Color({ r: 255, g: 0, b: 0 }), {
  mode: 'AUTOREVERSE',
  // pulsating: { pulse: 10, adjust: true },
});
