import { fetchAdminOrders } from "@/utils/queries";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminSalesPage() {
  const orders = await fetchAdminOrders();

  if (orders.length === 0) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl capitalize">sales</h1>
        <p className="text-muted-foreground">no paid orders yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl capitalize">sales</h1>
      <Table>
        <TableCaption className="capitalize">
          total paid orders: {orders.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>email</TableHead>
            <TableHead>products</TableHead>
            <TableHead>order total</TableHead>
            <TableHead>tax</TableHead>
            <TableHead>shipping</TableHead>
            <TableHead>date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.email}</TableCell>
              <TableCell>{order.products}</TableCell>
              <TableCell>{formatCurrency(order.orderTotal)}</TableCell>
              <TableCell>{formatCurrency(order.tax)}</TableCell>
              <TableCell>{formatCurrency(order.shipping)}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
