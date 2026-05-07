import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy-constructed Supabase client. createClient() throws "supabaseUrl
// is required" at module load when NEXT_PUBLIC_SUPABASE_URL is unset,
// which crashes Next 16's "Collecting page data" build pass on any
// platform that hasn't surfaced the env var (e.g. a Vercel scope
// where the var was missed). Same shape as L-011 for Stripe — defer
// construction so the build is robust and a missing var only kills
// the upload/delete paths at request time with a clean error.

let cachedClient: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set"
    );
  }
  cachedClient = createClient(url, key);
  return cachedClient;
}

export function getBucket(): string {
  const bucket = process.env.SUPABASE_BUCKET;
  if (!bucket) throw new Error("SUPABASE_BUCKET is not set");
  return bucket;
}

export async function uploadImage(image: File): Promise<string> {
  const bucket = getBucket();
  const newName = `${Date.now()}-${image.name}`;
  const { data, error } = await client()
    .storage.from(bucket)
    .upload(newName, image, { cacheControl: "3600" });
  if (error || !data) {
    console.error("[supabase] upload failed:", error);
    throw new Error(`image upload failed: ${error?.message ?? "unknown error"}`);
  }
  return client().storage.from(bucket).getPublicUrl(newName).data.publicUrl;
}

export async function deleteImage(publicUrl: string): Promise<void> {
  const bucket = getBucket();
  const parts = publicUrl.split(`/${bucket}/`);
  if (parts.length < 2) throw new Error("invalid Supabase public URL");
  const path = parts[1];
  const { error } = await client().storage.from(bucket).remove([path]);
  if (error) {
    console.error("[supabase] delete failed:", error);
    throw new Error(`image deletion failed: ${error.message}`);
  }
}
