import { Link } from "react-router-dom";
import { useMyPosts, useDeletePost, useUpdatePost } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PenLine, Trash2, Eye, EyeOff, Plus } from "lucide-react";

const BlogManage = () => {
  const { user } = useAuth();
  const { data: posts, isLoading } = useMyPosts();
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in first</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary" />
      </div>
      <Header />
      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-display font-bold text-foreground">Manage Posts</h1>
            <Button asChild size="sm">
              <Link to="/blog/new"><Plus className="w-4 h-4 mr-1" />New Post</Link>
            </Button>
          </div>

          <Separator className="mb-6" />

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : !posts || posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No posts yet — start writing your first one!</p>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <Card key={p.id} className="border-border/30 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                        <Badge variant={p.published ? "default" : "outline"} className="text-xs shrink-0">
                          {p.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.updated_at).toLocaleDateString("en-US")}
                        {p.tags?.length > 0 && ` · ${p.tags.join(", ")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updatePost.mutate({ id: p.id, published: !p.published })}
                        title={p.published ? "Unpublish" : "Publish"}
                      >
                        {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/blog/edit/${p.slug}`}><PenLine className="w-4 h-4" /></Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { if (confirm("Are you sure you want to delete this post?")) deletePost.mutate(p.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogManage;
