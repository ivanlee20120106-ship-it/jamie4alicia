import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface BlogPost {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type BlogPostInsert = Omit<BlogPost, "id" | "created_at" | "updated_at">;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || `post-${Date.now()}`;
}

export function usePublishedPosts(tag?: string) {
  return useQuery({
    queryKey: ["blog-posts", "published", tag],
    queryFn: async () => {
      let q = supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (tag) {
        q = q.contains("tags", [tag]);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: ["blog-posts", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
}

export function useMyPosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["blog-posts", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: !!user,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { title: string; description?: string; content: string; tags?: string[]; published?: boolean; cover_image?: string }) => {
      if (!user) throw new Error("Not signed in");
      const slug = generateSlug(input.title);
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          user_id: user.id,
          title: input.title,
          slug,
          description: input.description ?? null,
          content: input.content,
          tags: input.tags ?? [],
          published: input.published ?? false,
          cover_image: input.cover_image ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post created");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post updated");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post deleted");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useAllTags() {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("tags")
        .eq("published", true);
      if (error) throw error;
      const tagSet = new Set<string>();
      (data ?? []).forEach((row) => {
        (row.tags as string[] | null)?.forEach((t) => tagSet.add(t));
      });
      return Array.from(tagSet).sort();
    },
  });
}
