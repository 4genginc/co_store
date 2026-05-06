"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/utils/db";
import { getAdminUser } from "@/utils/admin";
import {
  productSchema,
  validateWithZodSchema,
  validateImageFile,
} from "@/utils/schemas";
import { uploadImage, deleteImage } from "@/utils/supabase";
import type { ActionState } from "@/components/form/FormContainer";

export async function createProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const userId = await getAdminUser();

    const imageResult = validateImageFile(formData.get("image"));
    if (!imageResult.ok) {
      return { message: imageResult.message, success: false };
    }

    const productResult = validateWithZodSchema(
      productSchema,
      Object.fromEntries(formData)
    );
    if (!productResult.ok) {
      return { message: productResult.message, success: false };
    }

    const imageUrl = await uploadImage(imageResult.data);

    await db.product.create({
      data: {
        ...productResult.data,
        image: imageUrl,
        clerkId: userId,
      },
    });
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not create product",
      success: false,
    };
  }
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await getAdminUser();
    const productId = formData.get("productId");
    if (typeof productId !== "string" || productId.length === 0) {
      return { message: "missing product id", success: false };
    }
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return { message: "product not found", success: false };
    }
    await db.product.delete({ where: { id: productId } });
    // Best-effort image cleanup. The DB row is the source of truth — if
    // storage cleanup fails we orphan an object rather than leaving a row
    // pointing at a deleted image.
    try {
      await deleteImage(product.image);
    } catch (e) {
      console.error("[supabase] image cleanup failed:", e);
    }
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not delete product",
      success: false,
    };
  }
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { message: "product deleted", success: true };
}
