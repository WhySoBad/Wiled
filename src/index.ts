import { Color } from './util/Color.class';
import { WiLED } from './wiled/classes/WiLED';

const led = new WiLED({
  frequency: 60,
});

led.setSpeed(0.1);

led.start();

led.setColor(new Color({ r: 0, g: 255, b: 0 }), {
  mode: 'AUTOREVERSE',
  pulsating: { pulse: 10, adjust: true },
});
