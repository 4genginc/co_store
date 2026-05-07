import { redirect } from "next/navigation";
import SectionTitle from "@/components/global/SectionTitle";
import CheckoutForm from "@/components/checkout/CheckoutForm";

type CheckoutPageProps = {
  searchParams: Promise<{ orderId?: string; cartId?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { orderId, cartId } = await searchParams;
  if (!orderId || !cartId) redirect("/cart");

  return (
    <section>
      <SectionTitle text="checkout" />
      <div className="mt-8">
        <CheckoutForm orderId={orderId} cartId={cartId} />
      </div>
    </section>
  );
}
