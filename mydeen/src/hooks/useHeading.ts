import { Magnetometer } from "expo-sensors";
import { useEffect, useState } from "react";

/** Возвращает курс устройства (0..360). paused=true — останавливает обновления. */
export default function useHeading(paused = false) {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    if (paused) return;
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      const deg = (360 - ((angle + 360) % 360)) % 360; // 0 = север
      setHeading(deg);
    });
    return () => sub.remove();
  }, [paused]);

  return heading;
}
