"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { getAdminUser, getAuthUser } from "@/utils/admin";
import {
  cartItemSchema,
  productSchema,
  reviewSchema,
  validateWithZodSchema,
  validateImageFile,
} from "@/utils/schemas";
import {
  fetchOrCreateCart,
  fetchProduct,
  updateCart,
  updateOrCreateCartItem,
} from "@/utils/queries";
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

export async function createReviewAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const userId = await getAuthUser();
    const result = validateWithZodSchema(
      reviewSchema,
      Object.fromEntries(formData)
    );
    if (!result.ok) {
      return { message: result.message, success: false };
    }
    const user = await currentUser();
    const authorName =
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Anonymous";
    const authorImageUrl = user?.imageUrl ?? "";

    await db.review.create({
      data: {
        ...result.data,
        clerkId: userId,
        authorName,
        authorImageUrl,
      },
    });
    revalidatePath(`/products/${result.data.productId}`);
    revalidatePath("/reviews");
    return { message: "review submitted", success: true };
  } catch (e) {
    // Composite unique (clerkId, productId) prevents a second review from
    // the same user. Map Prisma's P2002 to a human-readable message.
    const message =
      e instanceof Error && "code" in e && e.code === "P2002"
        ? "you have already reviewed this product"
        : e instanceof Error
          ? e.message
          : "could not submit review";
    return { message, success: false };
  }
}

export async function addToCartAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  let success = false;
  try {
    const userId = await getAuthUser();
    const result = validateWithZodSchema(
      cartItemSchema,
      Object.fromEntries(formData)
    );
    if (!result.ok) {
      return { message: result.message, success: false };
    }
    // Validate the product exists before mutating the cart so a stale
    // product id surfaces as an error instead of an orphan line item.
    await fetchProduct(result.data.productId);

    const cart = await fetchOrCreateCart({ userId });
    await updateOrCreateCartItem({
      productId: result.data.productId,
      cartId: cart.id,
      amount: result.data.amount,
    });
    await updateCart(cart.id);
    revalidatePath("/cart");
    success = true;
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not add to cart",
      success: false,
    };
  }
  // redirect() throws internally — keep it outside the try/catch so the
  // navigation control flow isn't swallowed as an action error.
  if (success) redirect("/cart");
  return { message: "", success: false };
}

// Place an order from the signed-in user's cart. Snapshots the cart's
// computed totals onto the new Order row, then clears the cart's line
// items and recomputes its totals back to zero. Phase 9.4 has no real
// payment integration, so isPaid is set to true here — when Stripe
// lands in Phase 10 this should flip to default false and only become
// true after webhook confirmation.
export async function createOrderAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  let success = false;
  try {
    const userId = await getAuthUser();
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    if (!email) {
      return {
        message: "your account has no email on file; cannot place order",
        success: false,
      };
    }

    const cart = await fetchOrCreateCart({ userId, errorOnFailure: true });
    if (cart.cartItems.length === 0) {
      return { message: "your cart is empty", success: false };
    }

    await db.$transaction([
      db.order.create({
        data: {
          clerkId: userId,
          products: cart.numItemsInCart,
          orderTotal: cart.orderTotal,
          tax: cart.tax,
          shipping: cart.shipping,
          email,
          isPaid: true,
        },
      }),
      db.cartItem.deleteMany({ where: { cartId: cart.id } }),
    ]);
    await updateCart(cart.id);
    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath("/admin/sales");
    success = true;
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not place order",
      success: false,
    };
  }
  if (success) redirect("/orders");
  return { message: "", success: false };
}

// Cart-row mutations. Plain (formData) -> Promise<void> shape so the
// client can call them inside startTransition without juggling
// ActionState. Ownership is enforced server-side: actions silently no-op
// if the cart item doesn't belong to the signed-in user. The route is
// behind the proxy auth gate, so getAuthUser() should not throw in
// normal flow — but if it does, the error boundary will render rather
// than mutating someone else's cart.

export async function updateCartItemAmountAction(formData: FormData) {
  const userId = await getAuthUser();
  const cartItemId = formData.get("cartItemId");
  if (typeof cartItemId !== "string" || cartItemId.length === 0) return;
  const amount = Number(formData.get("amount"));
  if (!Number.isInteger(amount) || amount < 1 || amount > 20) return;

  const item = await db.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: { select: { clerkId: true } } },
  });
  if (!item || item.cart.clerkId !== userId) return;

  await db.cartItem.update({ where: { id: cartItemId }, data: { amount } });
  await updateCart(item.cartId);
  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const userId = await getAuthUser();
  const cartItemId = formData.get("cartItemId");
  if (typeof cartItemId !== "string" || cartItemId.length === 0) return;

  const item = await db.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: { select: { clerkId: true } } },
  });
  if (!item || item.cart.clerkId !== userId) return;

  await db.cartItem.delete({ where: { id: cartItemId } });
  await updateCart(item.cartId);
  revalidatePath("/cart");
}

export async function deleteReviewAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const userId = await getAuthUser();
    const reviewId = formData.get("reviewId");
    if (typeof reviewId !== "string" || reviewId.length === 0) {
      return { message: "missing review id", success: false };
    }
    const review = await db.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return { message: "review not found", success: false };
    }
    if (review.clerkId !== userId) {
      return {
        message: "you can only delete your own reviews",
        success: false,
      };
    }
    await db.review.delete({ where: { id: reviewId } });
    revalidatePath(`/products/${review.productId}`);
    revalidatePath("/reviews");
    return { message: "review deleted", success: true };
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not delete review",
      success: false,
    };
  }
}
