// US Non-Farm Payrolls is released on the first Friday of each month
// (rare BLS holiday shifts aside) - a reliable enough rule to compute
// without needing a live data source.
function firstFridayOf(year: number, month: number) {
  const d = new Date(year, month, 1);
  const offsetToFriday = (5 - d.getDay() + 7) % 7;
  d.setDate(1 + offsetToFriday);
  return d;
}

export function getNextNFP() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let nextDate = firstFridayOf(now.getFullYear(), now.getMonth());
  if (nextDate < today) {
    nextDate = firstFridayOf(now.getFullYear(), now.getMonth() + 1);
  }

  const daysToGo = Math.round(
    (nextDate.getTime() - today.getTime()) / 86400000
  );
  const dateLabel = nextDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    date: nextDate,
    dateLabel,
    daysToGoLabel:
      daysToGo === 0 ? 'Today' : `${daysToGo} Day${daysToGo === 1 ? '' : 's'} To Go`,
  };
}
