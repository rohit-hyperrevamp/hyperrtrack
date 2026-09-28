/**
 * Follow real roads through a day's recorded GPS points (OSRM, chunked).
 * Returns the road geometry and its true driven length in metres, or null if
 * routing is unavailable.
 */
export type RoadRoute = { coords: [number, number][]; meters: number };

const cache = new Map<string, RoadRoute | null>();
const CHUNK = 25;

export async function roadRoute(path: [number, number][]): Promise<RoadRoute | null> {
  // Drop near-duplicates (~30 m) so GPS jitter while standing still isn't routed.
  const thin: [number, number][] = [];
  for (const p of path) {
    const l = thin[thin.length - 1];
    if (!l || Math.abs(l[0] - p[0]) + Math.abs(l[1] - p[1]) > 0.0003) thin.push(p);
  }
  if (thin.length < 2) return null;
  const key = thin.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join(";");
  if (cache.has(key)) return cache.get(key)!;
  const coords: [number, number][] = [];
  let meters = 0;
  try {
    for (let i = 0; i < thin.length - 1; i += CHUNK - 1) {
      const seg = thin.slice(i, i + CHUNK);
      if (seg.length < 2) break;
      const q = seg.map(([lat, lng]) => `${lng},${lat}`).join(";");
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${q}?overview=full&geometries=geojson`);
      if (!r.ok) throw new Error("route");
      const j = await r.json();
      const route = j?.routes?.[0];
      const c: [number, number][] | undefined = route?.geometry?.coordinates;
      if (!c?.length) throw new Error("route");
      coords.push(...c.map(([lng, lat]) => [lat, lng] as [number, number]));
      meters += Number(route.distance) || 0;
    }
    const out = { coords, meters };
    cache.set(key, out);
    return out;
  } catch {
    cache.set(key, null);
    return null;
  }
}
