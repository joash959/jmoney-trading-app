// Mirrors the web dashboard's src/components/dashboard/StatsGrid.tsx exactly
// (getNextNFP / getNextCPI) - hardcoded published BLS release dates, not a
// formula or a live data source, so both platforms always show the same
// date. Dates are constructed in device-local time, matching the web
// implementation.
const NFP_2026 = [
  '2026-01-09', '2026-02-06', '2026-03-06', '2026-04-03', '2026-05-08', '2026-06-05',
  '2026-07-02', '2026-08-07', '2026-09-04', '2026-10-02', '2026-11-06', '2026-12-04',
];
const CPI_2026 = [
  '2026-01-13', '2026-02-12', '2026-03-11', '2026-04-10', '2026-05-13', '2026-06-10',
  '2026-07-14', '2026-08-12', '2026-09-11', '2026-10-13', '2026-11-12', '2026-12-10',
];

function parseDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function nextEvent(list: string[], fallback: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = list.map(parseDate);
  const date = dates.find((d) => d >= today) ?? fallback;
  const daysToGo = Math.ceil((date.getTime() - today.getTime()) / 86400000);

  return {
    date,
    dateLabel: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    daysToGoLabel:
      daysToGo === 0 ? 'Today' : `${daysToGo} Day${daysToGo === 1 ? '' : 's'} To Go`,
  };
}

export function getNextNFP() {
  return nextEvent(NFP_2026, new Date(2027, 0, 8));
}

export function getNextCPI() {
  return nextEvent(CPI_2026, new Date(2027, 0, 12));
}
