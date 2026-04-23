export const API = "http://127.0.0.1:8000";
export const MAX_CAPACITY = 50;

export async function fetchOverview() {
  const res = await fetch(API + "/api/dashboard/overview");
  return await res.json();
}

export async function fetchTodaySummaries() {
  const res = await fetch(API + "/api/summaries/today");
  const data = await res.json();
  data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return data;
}

export function buildOccupancySeries(summaries) {
  let occ = 0;
  return summaries.map(s => {
    occ += Number(s.in_count) - Number(s.out_count);
    if (occ < 0) occ = 0;
    return occ;
  });
}

export function getOccupancyStatus(percent) {
  if (percent < 40) return { text: "Ocupación baja", color: "#86efac", ring: "#22c55e" };
  if (percent < 70) return { text: "Ocupación media", color: "#fde68a", ring: "#f59e0b" };
  if (percent < 90) return { text: "Ocupación alta", color: "#fdba74", ring: "#f97316" };
  return { text: "Ocupación crítica", color: "#fca5a5", ring: "#ef4444" };
}