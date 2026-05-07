import { getAuthUser } from "@/utils/admin";
import { fetchOrCreateCart } from "@/utils/queries";
import SectionTitle from "@/components/global/SectionTitle";
import EmptyList from "@/components/global/EmptyList";
import CartItemColumns from "@/components/cart/CartItemColumns";
import CartItemsList from "@/components/cart/CartItemsList";
import CartTotals from "@/components/cart/CartTotals";

export default async function CartPage() {
  const userId = await getAuthUser();
  const cart = await fetchOrCreateCart({ userId });

  if (cart.cartItems.length === 0) {
    return (
      <section>
        <SectionTitle text="shopping cart" />
        <EmptyList heading="Your cart is empty." className="mt-12" />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle text="shopping cart" />
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <CartItemColumns />
          <CartItemsList items={cart.cartItems} />
        </div>
        <div className="lg:col-span-4">
          <CartTotals cart={cart} />
        </div>
      </div>
    </section>
  );
}
