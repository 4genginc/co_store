import Link from "next/link";
import type { Product } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { LuLayoutGrid, LuList } from "react-icons/lu";
import EmptyList from "@/components/global/EmptyList";
import ProductsGrid from "./ProductsGrid";
import ProductsList from "./ProductsList";

type Layout = "grid" | "list";

type ProductsContainerProps = {
  products: Product[];
  layout: Layout;
  search: string;
};

export default function ProductsContainer({
  products,
  layout,
  search,
}: ProductsContainerProps) {
  const totalProducts = products.length;
  const searchTerm = search ? `&search=${search}` : "";

  return (
    <>
      <section>
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-lg">
            {totalProducts} product{totalProducts !== 1 && "s"}
          </h4>
          <div className="flex gap-x-4">
            <Link
              href={`/products?layout=grid${searchTerm}`}
              className={buttonVariants({
                variant: layout === "grid" ? "default" : "ghost",
                size: "icon",
              })}
            >
              <LuLayoutGrid />
            </Link>
            <Link
              href={`/products?layout=list${searchTerm}`}
              className={buttonVariants({
                variant: layout === "list" ? "default" : "ghost",
                size: "icon",
              })}
            >
              <LuList />
            </Link>
          </div>
        </div>
        <div className="border-b mt-4" />
      </section>

      {totalProducts === 0 ? (
        <EmptyList
          heading="Sorry, no products matched your search."
          className="mt-12"
        />
      ) : layout === "grid" ? (
        <ProductsGrid products={products} />
      ) : (
        <ProductsList products={products} />
      )}
    </>
  );
}
