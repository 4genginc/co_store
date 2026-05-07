// Header row for the cart items list. Hidden on small screens — the
// per-row CartItem layout is self-explanatory at narrow widths.
export default function CartItemColumns() {
  return (
    <div className="hidden md:grid grid-cols-[100px_1fr_220px] gap-4 pb-4 border-b text-sm uppercase tracking-wide text-muted-foreground">
      <span></span>
      <span>item</span>
      <span className="text-right">amount &amp; total</span>
    </div>
  );
}
