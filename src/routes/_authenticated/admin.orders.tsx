import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data: rows } = await supabase.from("orders")
        .select("id, status, total_price, created_at, user_id, cars(title, brand)")
        .order("created_at", { ascending: false });
      const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, name, email").in("id", userIds)
        : { data: [] as { id: string; name: string | null; email: string | null }[] };
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (rows ?? []).map((r) => ({ ...r, profile: map.get(r.user_id) }));
    },
  });

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as never }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); }
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">Orders</h1>
      <div className="glass-panel rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders yet</TableCell></TableRow>
            ) : orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.cars?.title ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <div>{o.profile?.name ?? "—"}</div>
                  <div className="text-xs">{o.profile?.email}</div>
                </TableCell>
                <TableCell className="text-primary">{formatPrice(Number(o.total_price))}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => update(o.id, v)}>
                    <SelectTrigger className="w-36"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
