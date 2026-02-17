import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = ['general', 'user', 'config', 'session', 'analytics'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCacheEntryDialog({ open, onOpenChange }: Props) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('{}');
  const [category, setCategory] = useState('general');
  const [ttl, setTtl] = useState('3600');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!key.trim()) {
      toast({ title: '请输入键名', variant: 'destructive' });
      return;
    }
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      toast({ title: 'JSON 格式无效', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const ttlNum = parseInt(ttl) || 3600;
    const expiresAt = new Date(Date.now() + ttlNum * 1000).toISOString();

    const { error } = await supabase.from('cache_entries').insert([{
      key: key.trim(),
      value: parsedValue as any,
      category,
      ttl_seconds: ttlNum,
      expires_at: expiresAt,
    }]);

    setLoading(false);
    if (error) {
      toast({ title: '添加失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '添加成功' });
      setKey('');
      setValue('{}');
      setCategory('general');
      setTtl('3600');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增缓存条目</DialogTitle>
          <DialogDescription>填写下方信息创建新的缓存数据条目</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>键名</Label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="cache:key:name" />
          </div>
          <div className="space-y-2">
            <Label>值 (JSON)</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder='{"data": "value"}' />
          </div>
          <div className="space-y-2">
            <Label>分类</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>TTL (秒)</Label>
            <Input type="number" value={ttl} onChange={(e) => setTtl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '添加中...' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
