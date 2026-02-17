import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { smartCache } from './useSmartCache';

export function useCacheRealtime(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('cache-entries-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cache_entries' },
        (payload) => {
          if (payload.eventType === 'DELETE' && payload.old && 'key' in payload.old) {
            smartCache.invalidate(payload.old.key as string);
          } else if (payload.new && 'key' in payload.new) {
            smartCache.invalidate(payload.new.key as string);
          }
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
