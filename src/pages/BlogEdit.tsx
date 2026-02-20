import { useParams, useNavigate } from "react-router-dom";
import { usePostBySlug, useUpdatePost } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import BlogEditor from "@/components/blog/BlogEditor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const BlogEdit = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: post, isLoading } = usePostBySlug(slug ?? "");
  const updatePost = useUpdatePost();
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-display font-bold text-foreground mb-6">Edit Post</h1>
          {isLoading ? (
            <Skeleton className="h-96" />
          ) : !post ? (
            <p className="text-muted-foreground">Post not found</p>
          ) : (
            <BlogEditor
              initial={post}
              saving={updatePost.isPending}
              onSave={(data) => {
                updatePost.mutate({ id: post.id, ...data }, {
                  onSuccess: (p) => navigate(`/blog/${p.slug}`),
                });
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogEdit;
