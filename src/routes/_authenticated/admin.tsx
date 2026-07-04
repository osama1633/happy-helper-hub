import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { LayoutDashboard, Car, ShoppingBag, Users, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: role } = await supabase.from("user_roles")
      .select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/cars", label: "Cars", icon: Car },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: Mail },
] as const;

function AdminLayout() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="glass-panel rounded-lg p-4 h-fit sticky top-24">
          <p className="text-xs tracking-[0.3em] text-primary mb-4 px-2">ADMIN</p>
          <nav className="space-y-1">
            {items.map((i) => (
              <Link key={i.to} to={i.to} activeOptions={{exact: i.exact}}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                activeProps={{className: "bg-primary/15 text-primary"}}>
                <i.icon className="size-4"/>{i.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div><Outlet/></div>
      </div>
    </PageShell>
  );
}
