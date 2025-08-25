export const deg2rad = (d: number) => (d * Math.PI) / 180;
export const rad2deg = (r: number) => (r * 180) / Math.PI;

/** bearing от lat/lng к Каабе (0 — север, по часовой) */
export function qiblaBearing(lat: number, lng: number) {
  const kaabaLat = deg2rad(21.422487);
  const kaabaLng = deg2rad(39.826206);
  const φ1 = deg2rad(lat);
  const λ1 = deg2rad(lng);

  const y = Math.sin(kaabaLng - λ1) * Math.cos(kaabaLat);
  const x = Math.cos(φ1) * Math.sin(kaabaLat) - Math.sin(φ1) * Math.cos(kaabaLat) * Math.cos(kaabaLng - λ1);
  const θ = Math.atan2(y, x);
  return (rad2deg(θ) + 360) % 360;
}

/** кратчайшая разница углов [-180..180] */
export function angleDelta(target: number, current: number) {
  let d = (target - current) % 360;
  if (d < -180) d += 360;
  if (d > 180) d -= 360;
  return d;
}

export function toDMS(lat: number, lng: number) {
  const fmt = (v: number, pos: string, neg: string) => {
    const s = Math.abs(v);
    const d = Math.floor(s);
    const m = Math.floor((s - d) * 60);
    return `${d}°${m.toString().padStart(2, "0")}'${v >= 0 ? pos : neg}`;
  };
  return `${fmt(lat, "N", "S")} ${fmt(lng, "E", "W")}`;
}
