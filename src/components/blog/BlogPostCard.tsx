import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { BlogPost } from "@/hooks/useBlogPosts";

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const BlogPostCard = ({ post }: { post: BlogPost }) => (
  <Link to={`/blog/${post.slug}`} className="group block">
    <Card className="overflow-hidden border-border/30 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 h-full">
      {post.cover_image && (
        <div className="overflow-hidden h-48">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(post.created_at)}</span>
          <span>·</span>
          <span>{readingTime(post.content)} min read</span>
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
      </CardHeader>
      {post.description && (
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
        </CardContent>
      )}
      <CardFooter className="pt-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {post.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardFooter>
    </Card>
  </Link>
);

export default BlogPostCard;
