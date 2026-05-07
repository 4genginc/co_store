import Image from "next/image";
import Link from "next/link";
import type { CartItem, Product } from "@prisma/client";
import { formatCurrency } from "@/utils/format";
import ThirdColumn from "./ThirdColumn";

type CartItemWithProduct = CartItem & { product: Product };

type CartItemsListProps = {
  items: CartItemWithProduct[];
};

export default function CartItemsList({ items }: CartItemsListProps) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[100px_1fr] md:grid-cols-[100px_1fr_220px] gap-4 py-6 border-b last:border-b-0 items-start"
        >
          <Link
            href={`/products/${item.productId}`}
            className="relative h-24 w-24 bg-muted rounded overflow-hidden"
          >
            <Image
              src={item.product.image}
              alt={item.product.name}
              fill
              sizes="100px"
              className="object-contain p-2"
            />
          </Link>
          <div className="min-w-0">
            <Link href={`/products/${item.productId}`}>
              <h3 className="capitalize font-medium hover:underline">
                {item.product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{item.product.company}</p>
            <p className="mt-1 text-sm">{formatCurrency(item.product.price)}</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <ThirdColumn
              cartItemId={item.id}
              amount={item.amount}
              unitPrice={item.product.price}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
