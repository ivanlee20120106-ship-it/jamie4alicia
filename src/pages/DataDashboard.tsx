import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { smartCache } from '@/hooks/useSmartCache';
import { useCacheRealtime } from '@/hooks/useCacheRealtime';
import { CacheStatsCards } from '@/components/dashboard/CacheStatsCards';
import { CacheDataTable, type CacheRow } from '@/components/dashboard/CacheDataTable';
import { AddCacheEntryDialog } from '@/components/dashboard/AddCacheEntryDialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AuthDialog from '@/components/AuthDialog';
import { Link } from 'react-router-dom';

export default function DataDashboard() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [data, setData] = useState<CacheRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    const cacheKey = 'dashboard:all';
    const cached = smartCache.get<CacheRow[]>(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows, error } = await supabase
      .from('cache_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: '加载失败', description: error.message, variant: 'destructive' });
    } else {
      const typed = (rows ?? []) as CacheRow[];
      smartCache.set(cacheKey, typed, 30);
      setData(typed);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  const handleRealtimeUpdate = useCallback(() => {
    smartCache.invalidate('dashboard:all');
    setRefreshKey((k) => k + 1);
  }, []);

  useCacheRealtime(handleRealtimeUpdate);

  const handleCleanup = async () => {
    if (!user) {
      toast({ title: '请先登录', variant: 'destructive' });
      return;
    }
    const { data: count, error } = await supabase.rpc('cleanup_expired_cache_entries');
    if (error) {
      toast({ title: '清理失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `已清理 ${count ?? 0} 条过期数据` });
      handleRealtimeUpdate();
    }
  };

  const stats = smartCache.stats();
  const categories = [...new Set(data.map((r) => r.category))];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-xl font-bold">数据缓存仪表盘</h1>
          </div>
          <div className="flex items-center gap-2">
            <AuthDialog user={user} onSignIn={signIn} onSignUp={signUp} onSignOut={signOut} />
            <Button variant="outline" size="sm" onClick={() => { smartCache.invalidate('dashboard:all'); setRefreshKey((k) => k + 1); }}>
              <RefreshCw className="h-4 w-4 mr-1" /> 刷新
            </Button>
            <Button variant="outline" size="sm" onClick={handleCleanup}>
              <Trash2 className="h-4 w-4 mr-1" /> 清理过期
            </Button>
            <Button size="sm" onClick={() => { if (!user) { toast({ title: '请先登录', variant: 'destructive' }); return; } setAddOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> 新增
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <CacheStatsCards
          totalEntries={data.length}
          hitRate={stats.hitRate}
          memoryKB={stats.memoryEstimateKB}
          expiredCount={stats.expiredCount}
        />
        <CacheDataTable data={data} loading={loading} categories={categories} />
      </main>

      <AddCacheEntryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
