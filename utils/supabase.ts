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
  if (error || !data) throw new Error("Image upload failed");
  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};

export const deleteImage = async (publicUrl: string): Promise<void> => {
  const parts = publicUrl.split(`/${bucket}/`);
  if (parts.length < 2) throw new Error("Invalid Supabase public URL");
  const path = parts[1];
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error("Image deletion failed");
};
