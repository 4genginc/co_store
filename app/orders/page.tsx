import { fetchUserOrders } from "@/utils/queries";
import { formatCurrency, formatDate } from "@/utils/format";
import SectionTitle from "@/components/global/SectionTitle";
import EmptyList from "@/components/global/EmptyList";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function OrdersPage() {
  const orders = await fetchUserOrders();

  if (orders.length === 0) {
    return (
      <section>
        <SectionTitle text="your orders" />
        <EmptyList heading="You haven't placed any orders yet." className="mt-12" />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle text="your orders" />
      <div className="mt-8">
        <Table>
          <TableCaption className="capitalize">
            total orders: {orders.length}
          </TableCaption>
          <TableHeader>
            <TableRow>
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
                <TableCell>{order.products}</TableCell>
                <TableCell>{formatCurrency(order.orderTotal)}</TableCell>
                <TableCell>{formatCurrency(order.tax)}</TableCell>
                <TableCell>{formatCurrency(order.shipping)}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
