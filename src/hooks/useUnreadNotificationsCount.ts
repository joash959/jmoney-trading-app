import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useUnreadNotificationsCount() {
  const { session } = useAuth();
  const [count, setCount] = useState(0);

  const refetch = useCallback(async () => {
    if (!session) {
      setCount(0);
      return;
    }
    const { count: unread } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);
    setCount(unread ?? 0);
  }, [session]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { count, refetch };
}
