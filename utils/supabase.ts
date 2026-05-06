import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const bucket = process.env.SUPABASE_BUCKET!;

export const uploadImage = async (image: File): Promise<string> => {
  const newName = `${Date.now()}-${image.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(newName, image, { cacheControl: "3600" });
  if (error || !data) {
    console.error("[supabase] upload failed:", error);
    throw new Error(`image upload failed: ${error?.message ?? "unknown error"}`);
  }
  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};

export const deleteImage = async (publicUrl: string): Promise<void> => {
  const parts = publicUrl.split(`/${bucket}/`);
  if (parts.length < 2) throw new Error("invalid Supabase public URL");
  const path = parts[1];
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("[supabase] delete failed:", error);
    throw new Error(`image deletion failed: ${error.message}`);
  }
};
