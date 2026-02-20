import { useState } from "react";
import { Link } from "react-router-dom";
import { usePublishedPosts, useAllTags } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PenLine } from "lucide-react";

const BlogList = () => {
  const [selectedTag, setSelectedTag] = useState<string>();
  const { data: posts, isLoading } = usePublishedPosts(selectedTag);
  const { data: tags } = useAllTags();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--love)/0.15),transparent_50%)]" />
      </div>

      <Header />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gradient-love glow-gold mb-3">
              Blog
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Thoughts, stories, and moments from our journey together
            </p>
            {user && (
              <div className="mt-4 flex justify-center gap-3">
                <Button asChild size="sm">
                  <Link to="/blog/new"><PenLine className="w-4 h-4 mr-1" />Write a Post</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/blog/manage">Manage Posts</Link>
                </Button>
              </div>
            )}
          </div>

          {tags && tags.length > 0 && (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge
                  variant={!selectedTag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(undefined)}
                >
                  All
                </Badge>
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant={selectedTag === t ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <Separator className="mb-8" />
            </>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">No posts yet</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogList;
