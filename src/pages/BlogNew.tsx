import { useNavigate } from "react-router-dom";
import { useCreatePost } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import BlogEditor from "@/components/blog/BlogEditor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BlogNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createPost = useCreatePost();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">请先登录后再写文章</p>
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
          <h1 className="text-3xl font-display font-bold text-foreground mb-6">写新文章</h1>
          <BlogEditor
            saving={createPost.isPending}
            onSave={(data) => {
              createPost.mutate(data, {
                onSuccess: (post) => navigate(`/blog/${post.slug}`),
              });
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogNew;
