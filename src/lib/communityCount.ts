// Mirrors the web dashboard's community member counter exactly, so both
// platforms show the same number: a deterministic function of the current
// date (not a real headcount), seeded from a fixed start date/count.
export function getCommunityCount() {
  const startDate = new Date('2026-01-09');
  const startCount = 5396;
  const days = Math.floor((Date.now() - startDate.getTime()) / 86400000);
  let total = 0;
  for (let i = 0; i < days; i++) {
    total += 50 + (((i * 17) + 31) % 51);
  }
  return startCount + total;
}
