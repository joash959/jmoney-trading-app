import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Badge, GameStats } from '../lib/gamification';

/** Returns a badge to celebrate when one is newly unlocked. The first time
 * it runs for a user it just records what's already unlocked, so existing
 * members aren't hit with a pile of celebrations on update. */
export function useBadgeUnlocks(stats: GameStats | null, userId: string | undefined) {
  const [celebrate, setCelebrate] = useState<Badge | null>(null);

  useEffect(() => {
    if (!stats || !userId) return;
    const key = `jm_badges_seen_${userId}`;
    let cancelled = false;
    (async () => {
      const unlocked = stats.badges.filter((b) => b.unlocked).map((b) => b.key);
      const raw = await AsyncStorage.getItem(key).catch(() => null);
      if (cancelled) return;
      if (raw === null) {
        await AsyncStorage.setItem(key, JSON.stringify(unlocked)).catch(() => {});
        return;
      }
      const seen = new Set<string>(JSON.parse(raw));
      const fresh = stats.badges.find((b) => b.unlocked && !seen.has(b.key));
      if (fresh) {
        setCelebrate(fresh);
        seen.add(fresh.key);
        await AsyncStorage.setItem(key, JSON.stringify([...seen])).catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stats, userId]);

  return { celebrate, dismiss: () => setCelebrate(null) };
}
