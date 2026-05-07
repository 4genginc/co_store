"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/utils/db";
import { getAdminUser, getAuthUser } from "@/utils/admin";
import {
  productSchema,
  validateWithZodSchema,
  validateImageFile,
} from "@/utils/schemas";
import { uploadImage, deleteImage, bucket } from "@/utils/supabase";
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

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await getAdminUser();
    const productId = formData.get("productId");
    if (typeof productId !== "string" || productId.length === 0) {
      return { message: "missing product id", success: false };
    }
    const productResult = validateWithZodSchema(
      productSchema,
      Object.fromEntries(formData)
    );
    if (!productResult.ok) {
      return { message: productResult.message, success: false };
    }
    await db.product.update({
      where: { id: productId },
      data: productResult.data,
    });
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);
    return { message: "product updated", success: true };
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not update product",
      success: false,
    };
  }
}

export async function updateProductImageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await getAdminUser();
    const productId = formData.get("productId");
    if (typeof productId !== "string" || productId.length === 0) {
      return { message: "missing product id", success: false };
    }
    const imageResult = validateImageFile(formData.get("image"));
    if (!imageResult.ok) {
      return { message: imageResult.message, success: false };
    }
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return { message: "product not found", success: false };
    }
    const newUrl = await uploadImage(imageResult.data);
    const oldUrl = product.image;
    await db.product.update({
      where: { id: productId },
      data: { image: newUrl },
    });
    // Best-effort cleanup of old image. Skip if the old URL isn't in our
    // bucket (e.g., seeded products point at MicroEmbedded's S3 — not ours
    // to delete).
    if (oldUrl.includes(`/${bucket}/`)) {
      try {
        await deleteImage(oldUrl);
      } catch (e) {
        console.error("[supabase] old image cleanup failed:", e);
      }
    }
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);
    return { message: "image updated", success: true };
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not update image",
      success: false,
    };
  }
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

export async function toggleFavoriteAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const userId = await getAuthUser();
    const productId = formData.get("productId");
    if (typeof productId !== "string" || productId.length === 0) {
      return { message: "missing product id", success: false };
    }
    const favoriteIdRaw = formData.get("favoriteId");
    const favoriteId =
      typeof favoriteIdRaw === "string" && favoriteIdRaw.length > 0
        ? favoriteIdRaw
        : null;

    if (favoriteId) {
      await db.favorite.delete({ where: { id: favoriteId } });
    } else {
      await db.favorite.create({ data: { clerkId: userId, productId } });
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/favorites");
    return {
      message: favoriteId ? "removed from favorites" : "added to favorites",
      success: true,
    };
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not update favorite",
      success: false,
    };
  }
}
