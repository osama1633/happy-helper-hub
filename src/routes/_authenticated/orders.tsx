import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders")
        .select("id, status, total_price, created_at, cars(title, slug, featured_image, brand)")
        .eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-16">
        <p className="text-xs tracking-[0.4em] text-primary">HISTORY</p>
        <h1 className="mt-3 font-display text-5xl">Your <span className="gold-gradient-text italic">orders</span></h1>
        {orders.length === 0 ? (
          <div className="mt-16 text-center py-20 glass-panel rounded-lg">
            <p className="text-muted-foreground">No orders yet.</p>
            <Button asChild className="mt-6"><Link to="/cars">Browse collection</Link></Button>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="glass-panel rounded-lg p-4 flex gap-4 items-center">
                <img src={o.cars?.featured_image} alt="" className="size-20 rounded object-cover"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground tracking-widest">{o.cars?.brand?.toUpperCase()}</p>
                  <h3 className="font-display text-lg truncate">{o.cars?.title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg gold-gradient-text">{formatPrice(Number(o.total_price))}</div>
                  <Badge variant="outline" className="mt-1 gold-border capitalize">{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
