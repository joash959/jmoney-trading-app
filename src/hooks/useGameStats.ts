import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { computeGameStats, GameStats } from '../lib/gamification';

/** Loads the player's journal, course progress and poll votes and turns
 * them into level / XP / streak / badges. Call `refresh` after an action
 * that earns XP. */
export function useGameStats() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [stats, setStats] = useState<GameStats | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [journalRes, progressRes, votesRes] = await Promise.all([
      supabase
        .from('trade_journal_entries')
        .select('trade_date, profit_loss')
        .eq('user_id', userId),
      supabase.from('user_course_progress').select('completed_at').eq('user_id', userId),
      supabase.from('market_sentiment_votes').select('vote_date').eq('user_id', userId),
    ]);
    const progress = (progressRes.data ?? []) as { completed_at: string | null }[];
    const votes = (votesRes.data ?? []) as { vote_date: string }[];
    // Same "today" the poll uses when it saves a vote (UTC date).
    const today = new Date().toISOString().slice(0, 10);
    setStats(
      computeGameStats({
        entries: (journalRes.data ?? []) as { trade_date: string; profit_loss: number }[],
        coursesStarted: progress.length,
        coursesCompleted: progress.filter((p) => p.completed_at).length,
        pollVotes: votes.length,
        votedToday: votes.some((v) => v.vote_date === today),
      })
    );
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, refresh };
}
