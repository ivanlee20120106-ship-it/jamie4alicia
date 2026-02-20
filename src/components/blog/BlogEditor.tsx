import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, Save, Send, X, Plus } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface Props {
  initial?: BlogPost | null;
  onSave: (data: { title: string; description: string; content: string; tags: string[]; published: boolean; cover_image: string }) => void;
  saving?: boolean;
}

const BlogEditor = ({ initial, onSave, saving }: Props) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? "");
      setContent(initial.content);
      setCoverImage(initial.cover_image ?? "");
      setTags(initial.tags ?? []);
    }
  }, [initial]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const handleSave = (published: boolean) => {
    onSave({ title, description, content, tags, published, cover_image: coverImage });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">标题</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover">封面图片 URL</Label>
          <Input id="cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">描述</Label>
        <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简短描述..." />
      </div>

      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex items-center gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="输入标签后按回车"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          />
          <Button type="button" size="icon" variant="outline" onClick={addTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1">
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2 mb-2">
        <Button variant={preview ? "default" : "outline"} size="sm" onClick={() => setPreview(!preview)}>
          <Eye className="w-4 h-4 mr-1" />
          {preview ? "编辑" : "预览"}
        </Button>
      </div>

      {preview ? (
        <Card>
          <CardHeader><CardTitle>{title || "无标题"}</CardTitle></CardHeader>
          <CardContent><MarkdownRenderer content={content} /></CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="content">内容（Markdown）</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[400px] rounded-lg border border-border bg-muted/50 p-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            placeholder="使用 Markdown 格式撰写文章内容..."
          />
        </div>
      )}

      <div className="flex items-center gap-3 justify-end">
        <Button variant="outline" onClick={() => handleSave(false)} disabled={saving || !title}>
          <Save className="w-4 h-4 mr-1" />
          保存草稿
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving || !title}>
          <Send className="w-4 h-4 mr-1" />
          发布
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;
