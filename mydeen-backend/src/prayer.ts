import { PrayerTimes, CalculationMethod, Coordinates, SunnahTimes } from "adhan";

export type PrayerTimeMap = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  qiyam: Date;
};

export function getPrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date()
): PrayerTimeMap {
  const params = CalculationMethod.MuslimWorldLeague();
  const coords = new Coordinates(lat, lng);
  const times = new PrayerTimes(coords, date, params);
  const sunnah = new SunnahTimes(times);

  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
    qiyam: sunnah.middleOfTheNight,
  };
}

export function getNextPrayer(
  lat: number,
  lng: number,
  now: Date = new Date(),
  date: Date = new Date()
) {
  const t = getPrayerTimes(lat, lng, date);
  const order: [name: string, time: Date][] = [
    ["Fajr", t.fajr],
    ["Sunrise", t.sunrise],
    ["Dhuhr", t.dhuhr],
    ["Asr", t.asr],
    ["Maghrib", t.maghrib],
    ["Isha", t.isha],
  ];
  const upcoming = order.find(([, time]) => now < time);
  return upcoming
    ? { name: upcoming[0], time: upcoming[1] }
    : { name: "Fajr", time: t.fajr };
}
