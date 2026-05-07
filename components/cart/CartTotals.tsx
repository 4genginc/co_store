import { formatCurrency } from "@/utils/format";
import PlaceOrderButton from "./PlaceOrderButton";

type CartTotalsProps = {
  cart: {
    cartTotal: number;
    shipping: number;
    tax: number;
    orderTotal: number;
  };
};

export default function CartTotals({ cart }: CartTotalsProps) {
  return (
    <div className="bg-muted rounded-lg p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold capitalize">order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="subtotal" value={formatCurrency(cart.cartTotal)} />
        <Row label="shipping" value={formatCurrency(cart.shipping)} />
        <Row label="tax" value={formatCurrency(cart.tax)} />
      </dl>
      <hr className="my-4 border-border" />
      <dl>
        <Row
          label="order total"
          value={formatCurrency(cart.orderTotal)}
          emphasize
        />
      </dl>
      <PlaceOrderButton />
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={
        emphasize
          ? "flex justify-between text-base font-semibold"
          : "flex justify-between"
      }
    >
      <dt className="capitalize">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
