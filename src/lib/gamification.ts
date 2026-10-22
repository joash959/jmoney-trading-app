import type { Icon3DName } from '../components/Icon3D';

// Levels, XP, streaks and badges - all derived from data the app already
// stores (journal entries, course progress, sentiment votes), so there's
// nothing extra to save or keep in sync.

export type GameInput = {
  /** Journal entries: ISO date + P&L. */
  entries: { trade_date: string; profit_loss: number }[];
  coursesStarted: number;
  coursesCompleted: number;
  pollVotes: number;
  /** Voted in today's poll. */
  votedToday?: boolean;
};

export type Badge = {
  key: string;
  icon: Icon3DName;
  title: string;
  description: string;
  unlocked: boolean;
  /** 0-1 progress towards unlocking. */
  progress: number;
};

export type GameStats = {
  xp: number;
  level: number;
  levelName: string;
  /** XP needed to reach the current and next level. */
  levelFloor: number;
  levelCeil: number;
  /** Consecutive trading days (weekdays) logged, ending today or the last trading day. */
  streak: number;
  badges: Badge[];
  /** Daily missions state. */
  loggedToday: boolean;
  votedToday: boolean;
};

export const XP = {
  journalEntry: 10,
  greenDay: 5,
  courseStarted: 20,
  courseCompleted: 100,
  pollVote: 5,
};

const LEVELS = [
  { at: 0, name: 'Rookie' },
  { at: 100, name: 'Apprentice' },
  { at: 250, name: 'Trader' },
  { at: 500, name: 'Pro Trader' },
  { at: 900, name: 'Elite Trader' },
  { at: 1500, name: 'Master' },
  { at: 2500, name: 'Legend' },
  { at: 4000, name: 'Millionaire Mentor' },
];

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function previousTradingDay(d: Date) {
  const p = new Date(d);
  do {
    p.setDate(p.getDate() - 1);
  } while (p.getDay() === 0 || p.getDay() === 6);
  return p;
}

/** Weekdays in a row with a journal entry. Weekends never break a streak,
 * and today not being logged yet doesn't either. */
export function computeStreak(dates: Set<string>, today = new Date()) {
  let day = new Date(today);
  day.setHours(0, 0, 0, 0);
  if (day.getDay() === 0 || day.getDay() === 6 || !dates.has(toISO(day))) {
    day = previousTradingDay(day);
  }
  let streak = 0;
  while (dates.has(toISO(day))) {
    streak += 1;
    day = previousTradingDay(day);
  }
  return streak;
}

export function computeGameStats(input: GameInput): GameStats {
  const days = new Set(input.entries.map((e) => e.trade_date));
  const greenDays = input.entries.filter((e) => Number(e.profit_loss) > 0).length;
  const streak = computeStreak(days);

  const xp =
    input.entries.length * XP.journalEntry +
    greenDays * XP.greenDay +
    input.coursesStarted * XP.courseStarted +
    input.coursesCompleted * XP.courseCompleted +
    input.pollVotes * XP.pollVote;

  let levelIndex = 0;
  LEVELS.forEach((l, i) => {
    if (xp >= l.at) levelIndex = i;
  });
  const next = LEVELS[levelIndex + 1];

  const now = new Date();
  const monthPrefix = toISO(now).slice(0, 7);
  const monthPnl = input.entries
    .filter((e) => e.trade_date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + Number(e.profit_loss), 0);

  const badge = (
    key: string,
    icon: Icon3DName,
    title: string,
    description: string,
    value: number,
    target: number
  ): Badge => ({
    key,
    icon,
    title,
    description,
    unlocked: value >= target,
    progress: Math.min(value / target, 1),
  });

  const badges = [
    badge('first-trade', 'journal', 'First entry', 'Log your first trade', input.entries.length, 1),
    badge('green-day', 'green-heart', 'Green day', 'Finish a day in profit', greenDays, 1),
    badge('on-fire', 'fire', 'On fire', '5-day journal streak', streak, 5),
    badge('consistent', 'calendar', 'Consistent', 'Log 20 trading days', days.size, 20),
    badge('student', 'courses', 'Student', 'Start a course', input.coursesStarted, 1),
    badge('graduate', 'medal', 'Graduate', 'Complete a course', input.coursesCompleted, 1),
    badge('market-voice', 'ballot', 'Market voice', 'Vote in 5 sentiment polls', input.pollVotes, 5),
    badge('profitable-month', 'money-bag', 'Profitable month', 'End this month in profit', monthPnl > 0 ? 1 : 0, 1),
  ];

  return {
    xp,
    level: levelIndex + 1,
    levelName: LEVELS[levelIndex].name,
    levelFloor: LEVELS[levelIndex].at,
    levelCeil: next ? next.at : LEVELS[levelIndex].at,
    streak,
    badges,
    loggedToday: days.has(toISO(now)),
    votedToday: !!input.votedToday,
  };
}
