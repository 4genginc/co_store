import Link from "next/link";
import { Edit2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import DeleteProductForm from "@/components/admin/DeleteProductForm";
import { fetchAdminProducts } from "@/utils/queries";
import { formatCurrency } from "@/utils/format";

export default async function AdminProductsPage() {
  const products = await fetchAdminProducts();

  if (products.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl capitalize">my products</h1>
        <p className="text-muted-foreground">no products yet — create one to get started.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl capitalize">my products</h1>
      <Table>
        <TableCaption className="capitalize">
          total products: {products.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>name</TableHead>
            <TableHead>company</TableHead>
            <TableHead>price</TableHead>
            <TableHead className="text-right">actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link
                  href={`/products/${product.id}`}
                  className="capitalize hover:underline"
                >
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="capitalize">{product.company}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  aria-label="edit product"
                  className={buttonVariants({ variant: "outline", size: "icon" })}
                >
                  <Edit2 className="size-4" />
                </Link>
                <DeleteProductForm productId={product.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
