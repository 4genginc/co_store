import { fetchAllProducts } from "@/utils/queries";
import ProductsContainer from "@/components/products/ProductsContainer";

type ProductsPageProps = {
  searchParams: Promise<{ layout?: string; search?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { layout: layoutParam, search: searchParam } = await searchParams;
  const layout = layoutParam === "list" ? "list" : "grid";
  const search = searchParam ?? "";
  const products = await fetchAllProducts({ search });

  return <ProductsContainer products={products} layout={layout} search={search} />;
}
