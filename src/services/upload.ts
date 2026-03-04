import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return getPublicUrl(bucket, path);
}

export async function deleteImage(
  bucket: string,
  path: string
): Promise<void> {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabaseAdmin = createAdminClient();

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}
