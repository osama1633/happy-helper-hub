import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/checkout/$slug")({
  component: Checkout,
});

function Checkout() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState("visa");
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const { data: car } = useQuery({
    queryKey: ["car", slug],
    queryFn: async () => {
      const { data } = await supabase.from("cars").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
  });

  if (!car) return <PageShell><div className="p-20 text-center text-muted-foreground">Loading...</div></PageShell>;

  const total = Number(car.price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProcessing(true);
    // Simulated payment
    await new Promise((r) => setTimeout(r, 1500));
    const { error } = await supabase.from("orders").insert({
      user_id: user.id, car_id: car.id, total_price: total, status: "confirmed",
    });
    setProcessing(false);
    if (error) { toast.error(error.message); return; }
    setComplete(true);
    setTimeout(() => navigate({ to: "/orders" }), 2200);
  };

  if (complete) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <motion.div initial={{scale:0.6, opacity:0}} animate={{scale:1, opacity:1}}
            className="glass-panel rounded-lg p-10">
            <CheckCircle2 className="mx-auto size-16 text-primary mb-4"/>
            <h1 className="font-display text-3xl">Order confirmed</h1>
            <p className="mt-3 text-muted-foreground">Our concierge team will contact you within one business hour.</p>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-16 grid gap-10 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handleSubmit} className="glass-panel rounded-lg p-8 space-y-8">
          <div>
            <p className="text-xs tracking-[0.4em] text-primary">CHECKOUT</p>
            <h1 className="mt-2 font-display text-3xl">Complete your acquisition</h1>
          </div>

          <section>
            <h2 className="font-display text-lg mb-4">Billing details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input required defaultValue={user?.user_metadata?.name}/></Field>
              <Field label="Email"><Input type="email" required defaultValue={user?.email}/></Field>
              <Field label="Phone"><Input required/></Field>
              <Field label="Country"><Input required defaultValue="United States"/></Field>
              <div className="sm:col-span-2"><Field label="Delivery address"><Input required/></Field></div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg mb-4">Payment method</h2>
            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { v: "visa", l: "Visa" },
                { v: "mastercard", l: "Mastercard" },
                { v: "apple", l: "Apple Pay" },
                { v: "google", l: "Google Pay" },
              ].map((p) => (
                <label key={p.v} className={`glass-panel rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${method === p.v ? "ring-2 ring-primary" : ""}`}>
                  <RadioGroupItem value={p.v} className="sr-only"/>
                  <CreditCard className="size-6 text-primary"/>
                  <span className="text-sm">{p.l}</span>
                </label>
              ))}
            </RadioGroup>
            {(method === "visa" || method === "mastercard") && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Field label="Card number"><Input placeholder="1234 5678 9012 3456" required/></Field></div>
                <Field label="Expiry"><Input placeholder="MM/YY" required/></Field>
                <Field label="CVC"><Input placeholder="123" required/></Field>
              </div>
            )}
          </section>

          <Button type="submit" size="lg" className="w-full h-12" disabled={processing}>
            {processing ? "Processing..." : `Pay ${formatPrice(total)}`}
          </Button>
          <p className="text-xs text-muted-foreground text-center flex items-center gap-2 justify-center">
            <ShieldCheck className="size-3"/> Secure encrypted transaction — demo mode
          </p>
        </form>

        <aside className="glass-panel rounded-lg p-8 h-fit sticky top-24">
          <h3 className="text-xs tracking-widest text-primary mb-4">ORDER SUMMARY</h3>
          <Link to="/cars/$slug" params={{slug: car.slug}} className="block">
            <img src={car.featured_image} alt="" className="w-full aspect-[16/10] object-cover rounded mb-4"/>
            <p className="text-xs text-muted-foreground tracking-widest">{car.brand.toUpperCase()}</p>
            <h4 className="font-display text-lg mt-1">{car.title}</h4>
          </Link>
          <div className="border-t border-border/40 mt-6 pt-6 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(total)}/>
            <Row label="Concierge delivery" value="Complimentary"/>
            <Row label="Import duties" value="Included"/>
          </div>
          <div className="border-t border-border/40 mt-4 pt-4 flex justify-between items-baseline">
            <span className="text-xs tracking-widest text-muted-foreground">TOTAL</span>
            <span className="font-display text-2xl gold-gradient-text">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs tracking-widest text-muted-foreground">{label.toUpperCase()}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
