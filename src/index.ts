import { Color } from "./util/Color.class";
import { Wiled } from "./wiled/Wiled.class";

const wiled: Wiled = new Wiled({
  frequency: 60,
  server: true,
});

wiled.setSpeed(0.1);
wiled.setPulseSpeed(0.15);

wiled.setColor(new Color({ r: 0, g: 255, b: 0 }), {
  mode: "AUTOREVERSE",
  pulsating: { pulse: 10, adjust: true },
});
