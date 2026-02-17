import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, HardDrive, AlertTriangle } from 'lucide-react';

interface StatsProps {
  totalEntries: number;
  hitRate: string;
  memoryKB: number;
  expiredCount: number;
}

export function CacheStatsCards({ totalEntries, hitRate, memoryKB, expiredCount }: StatsProps) {
  const cards = [
    { title: '总条目数', value: totalEntries, icon: Database, color: 'text-blue-500' },
    { title: '缓存命中率', value: `${hitRate}%`, icon: Activity, color: 'text-green-500' },
    { title: '内存使用', value: `${memoryKB} KB`, icon: HardDrive, color: 'text-purple-500' },
    { title: '过期条目', value: expiredCount, icon: AlertTriangle, color: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
