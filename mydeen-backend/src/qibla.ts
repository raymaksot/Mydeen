// Направление к Каабе (bearing) от широты/долготы пользователя
// Возвращает угол в градусах (0 — север, по часовой стрелке)
export function qiblaBearing(lat: number, lng: number): number {
  const kaabaLat = deg2rad(21.422487);
  const kaabaLng = deg2rad(39.826206);
  const φ1 = deg2rad(lat);
  const λ1 = deg2rad(lng);

  const y = Math.sin(kaabaLng - λ1) * Math.cos(kaabaLat);
  const x =
    Math.cos(φ1) * Math.sin(kaabaLat) -
    Math.sin(φ1) * Math.cos(kaabaLat) * Math.cos(kaabaLng - λ1);
  const θ = Math.atan2(y, x);
  return (rad2deg(θ) + 360) % 360;
}

const deg2rad = (d: number) => (d * Math.PI) / 180;
const rad2deg = (r: number) => (r * 180) / Math.PI;
