import { supabase } from "@/integrations/supabase/client";

export async function deletePhotoWithFiles(photo: {
  id: string;
  storage_path: string;
  thumbnail_path?: string | null;
  compressed_path?: string | null;
}) {
  const pathsToDelete = [
    photo.storage_path,
    photo.thumbnail_path,
    photo.compressed_path,
  ].filter(Boolean) as string[];

  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("photos")
      .remove(pathsToDelete);

    if (storageError) {
      console.error("Failed to delete storage files:", storageError);
    }
  }

  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", photo.id);

  if (error) throw error;
}
