import { z, type ZodType } from "zod";

const MAX_IMAGE_BYTES = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(100, "name must be 100 characters or fewer"),
  company: z
    .string()
    .min(2, "company must be at least 2 characters")
    .max(100, "company must be 100 characters or fewer"),
  description: z
    .string()
    .min(10, "description must be at least 10 characters")
    .max(2000, "description must be 2000 characters or fewer"),
  featured: z.preprocess(
    (v) => v === "on" || v === true || v === "true",
    z.boolean()
  ),
  price: z.coerce
    .number({ error: "price must be a number" })
    .int("price must be a whole number of cents")
    .nonnegative("price cannot be negative"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const imageSchema = z.object({
  image: z
    .instanceof(File, { error: "image is required" })
    .refine((file) => file.size > 0, "image is required")
    .refine(
      (file) => file.size <= MAX_IMAGE_BYTES,
      `image must be smaller than ${MAX_IMAGE_BYTES / 1024 / 1024} MB`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      `image must be one of: ${ACCEPTED_IMAGE_TYPES.join(", ")}`
    ),
});

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export function validateWithZodSchema<T>(
  schema: ZodType<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    message: result.error.issues.map((issue) => issue.message).join("; "),
  };
}

export function validateImageFile(file: unknown): ValidationResult<File> {
  const result = validateWithZodSchema(imageSchema, { image: file });
  if (!result.ok) return result;
  return { ok: true, data: result.data.image };
}
