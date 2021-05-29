import { WiLED } from './wiled/classes/WiLED';

const led = new WiLED({
  frequency: 60,
});

led.start();

led.setColor = {
  r: 255,
  g: 0,
  b: 0,
};
