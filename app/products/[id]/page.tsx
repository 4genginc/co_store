import Image from "next/image";
import { fetchSingleProduct } from "@/utils/actions";
import { formatCurrency } from "@/utils/format";
import BreadCrumbs from "@/components/single-product/BreadCrumbs";
import ProductRating from "@/components/single-product/ProductRating";
import AddToCart from "@/components/single-product/AddToCart";
import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";

type SingleProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SingleProductPage({
  params,
}: SingleProductPageProps) {
  const { id } = await params;
  const product = await fetchSingleProduct(id);

  return (
    <section>
      <BreadCrumbs name={product.name} />
      <div className="mt-6 grid gap-y-8 lg:grid-cols-2 lg:gap-x-16">
        <div className="relative h-full w-full min-h-[24rem] bg-muted rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-contain p-8"
          />
        </div>
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="capitalize text-3xl font-bold">{product.name}</h1>
            <FavoriteToggleButton productId={product.id} />
          </div>
          <p className="mt-2 text-muted-foreground text-xl">{product.company}</p>
          <div className="mt-4">
            <ProductRating productId={product.id} />
          </div>
          <p className="mt-6 text-2xl">{formatCurrency(product.price)}</p>
          {product.priceNote && (
            <p className="mt-2 text-sm text-muted-foreground italic">
              {product.priceNote}
            </p>
          )}
          <p className="mt-6 leading-8 text-muted-foreground">
            {product.description}
          </p>
          <AddToCart productId={product.id} />
        </div>
      </div>
    </section>
  );
}
