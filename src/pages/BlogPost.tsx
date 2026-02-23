import { useParams, Link } from "react-router-dom";
import { usePostBySlug } from "@/hooks/useBlogPosts";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { useEffect } from "react";

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function BlogPostMeta({ post }: { post: { title: string; description?: string | null; cover_image?: string | null } }) {
  useEffect(() => {
    document.title = `${post.title} — Jamie & Alicia`;
    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
      if (!el) { el = document.createElement("meta"); (prop.startsWith("og:") ? el.setAttribute("property", prop) : el.setAttribute("name", prop)); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("og:title", `${post.title} — Jamie & Alicia`);
    setMeta("og:description", post.description || "A story from Jamie & Alicia's love journal.");
    if (post.cover_image) setMeta("og:image", post.cover_image);
    setMeta("twitter:title", `${post.title} — Jamie & Alicia`);
    setMeta("twitter:description", post.description || "A story from Jamie & Alicia's love journal.");
    if (post.cover_image) setMeta("twitter:image", post.cover_image);
    return () => { document.title = "Jamie & Alicia — Our Love Story"; };
  }, [post.title, post.description, post.cover_image]);
  return null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePostBySlug(slug ?? "");

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary" />
      </div>

      <Header />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link to="/blog"><ChevronLeft className="w-4 h-4 mr-1" />Back to Blog</Link>
          </Button>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-96" />
            </div>
          ) : !post ? (
            <p className="text-center text-muted-foreground py-20">Post not found</p>
          ) : (
            <article>
              <BlogPostMeta post={post} />
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-lg mb-6"
                />
              )}

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.created_at)}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{readingTime(post.content)} min read</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">
                {post.title}
              </h1>

              {post.description && (
                <p className="text-lg text-muted-foreground mb-4">{post.description}</p>
              )}

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              )}

              <Separator className="mb-8" />

              <MarkdownRenderer content={post.content} />

              <Separator className="my-8" />

              <div className="text-center">
                <Button asChild variant="outline">
                  <Link to="/blog"><ChevronLeft className="w-4 h-4 mr-1" />Back to Blog</Link>
                </Button>
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
