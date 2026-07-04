import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, ShoppingBag, Users, DollarSign } from "lucide-react";
import { formatPrice, formatNumber } from "@/lib/format";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [cars, orders, users, revenue] = await Promise.all([
        supabase.from("cars").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_price"),
      ]);
      const totalRevenue = (revenue.data ?? []).reduce((s, o) => s + Number(o.total_price), 0);
      return {
        cars: cars.count ?? 0, orders: orders.count ?? 0,
        users: users.count ?? 0, revenue: totalRevenue,
      };
    },
  });

  const cards = [
    { icon: Car, k: formatNumber(stats?.cars ?? 0), v: "Total vehicles" },
    { icon: ShoppingBag, k: formatNumber(stats?.orders ?? 0), v: "Total orders" },
    { icon: Users, k: formatNumber(stats?.users ?? 0), v: "Registered users" },
    { icon: DollarSign, k: formatPrice(stats?.revenue ?? 0), v: "Revenue" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Overview</h1>
      <p className="mt-2 text-muted-foreground">Real-time metrics for OSAMA.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.v} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i*0.05}}
            className="glass-panel rounded-lg p-6">
            <c.icon className="size-5 text-primary"/>
            <div className="mt-4 font-display text-3xl gold-gradient-text">{c.k}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{c.v}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
