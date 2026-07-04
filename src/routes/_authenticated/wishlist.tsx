import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { CarCard, type CarSummary } from "@/components/car-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const { data: cars = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CarSummary[]> => {
      const { data, error } = await supabase.from("wishlist")
        .select("cars(id,slug,title,brand,year,price,horsepower,top_speed,featured_image)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.cars).filter(Boolean) as unknown as CarSummary[];
    },
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <p className="text-xs tracking-[0.4em] text-primary">SAVED</p>
        <h1 className="mt-3 font-display text-5xl">Your <span className="gold-gradient-text italic">wishlist</span></h1>
        {cars.length === 0 ? (
          <div className="mt-16 text-center py-20 glass-panel rounded-lg">
            <Heart className="mx-auto size-8 text-primary mb-4"/>
            <p className="text-muted-foreground">No vehicles saved yet.</p>
            <Button asChild className="mt-6"><Link to="/cars">Browse collection</Link></Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((c, i) => <CarCard key={c.id} car={c} index={i}/>)}
          </div>
        )}
      </div>
    </PageShell>
  );
}
