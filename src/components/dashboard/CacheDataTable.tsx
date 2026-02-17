import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

export interface CacheRow {
  id: string;
  key: string;
  value: unknown;
  category: string;
  ttl_seconds: number;
  expires_at: string;
  access_count: number;
  last_accessed_at: string;
  created_at: string;
}

type SortField = 'key' | 'category' | 'ttl_seconds' | 'access_count' | 'expires_at';

interface Props {
  data: CacheRow[];
  loading: boolean;
  categories: string[];
}

export function CacheDataTable({ data, loading, categories }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at' as SortField);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = data;
    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.key.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return result;
  }, [data, categoryFilter, search, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const SortableHead = ({ field, label }: { field: SortField; label: string }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <span className="inline-flex items-center gap-1">
        {label} <ArrowUpDown className="h-3 w-3" />
      </span>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="搜索键名或分类..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead field="key" label="键名" />
              <SortableHead field="category" label="分类" />
              <SortableHead field="ttl_seconds" label="TTL(秒)" />
              <SortableHead field="expires_at" label="过期时间" />
              <SortableHead field="access_count" label="访问次数" />
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm">{row.key}</TableCell>
                  <TableCell><Badge variant="secondary">{row.category}</Badge></TableCell>
                  <TableCell>{row.ttl_seconds}</TableCell>
                  <TableCell className="text-sm">{format(new Date(row.expires_at), 'MM-dd HH:mm:ss')}</TableCell>
                  <TableCell>{row.access_count}</TableCell>
                  <TableCell>
                    {isExpired(row.expires_at) ? (
                      <Badge variant="destructive">已过期</Badge>
                    ) : (
                      <Badge variant="secondary">活跃</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
