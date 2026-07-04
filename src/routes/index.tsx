import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { ArrowRight, Shield, Sparkles, Trophy, Globe2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { CarCard, type CarSummary } from "@/components/car-card";
import { IntroAnimation } from "@/components/intro-animation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurelia Motors — The World's Finest Automobiles" },
      { name: "description", content: "A private atelier of the world's most exceptional luxury automobiles: Ferrari, Lamborghini, Rolls-Royce, Bentley, Porsche, McLaren and more." },
      { property: "og:title", content: "Aurelia Motors — Luxury Car Marketplace" },
      { property: "og:description", content: "Curated luxury automobiles delivered globally. By appointment only." },
    ],
  }),
  component: HomePage,
});

const brands = [
  "Ferrari","Lamborghini","Rolls Royce","Bentley","Porsche",
  "McLaren","Mercedes AMG","BMW M","Audi RS","Aston Martin",
];

function useFeaturedCars() {
  return useQuery({
    queryKey: ["featured-cars"],
    queryFn: async (): Promise<CarSummary[]> => {
      const { data, error } = await supabase
        .from("cars").select("id,slug,title,brand,year,price,horsepower,top_speed,featured_image")
        .eq("featured", true).order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      return (data ?? []) as unknown as CarSummary[];
    },
  });
}

function HomePage() {
  const { data: cars = [] } = useFeaturedCars();
  return (
    <PageShell>
      <IntroAnimation />
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/hero-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/70 via-onyx/60 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-24 md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-xs md:text-sm tracking-[0.4em] text-primary mb-6"
          >
            EST. MMXXV · PRIVATE ATELIER
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl"
          >
            The world's most <span className="gold-gradient-text italic">exceptional</span> automobiles.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            A curated collection of hypercars, grand tourers and coach-built masterpieces.
            Each vehicle is authenticated, inspected and delivered by our concierge team.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button asChild size="lg" className="h-12 px-8">
              <Link to="/cars">
                Explore the collection <ArrowRight className="ml-1 size-4"/>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 gold-border">
              <Link to="/contact">Private concierge</Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary text-xs tracking-widest"
        >
          SCROLL
        </motion.div>
      </section>

      {/* FEATURED CARS */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-primary mb-3">FEATURED</p>
            <h2 className="font-display text-4xl md:text-5xl">This week's <span className="gold-gradient-text italic">obsessions</span></h2>
          </div>
          <Link to="/cars" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
        </div>
      </section>

      {/* BRANDS */}
      <section className="border-y border-border/40 bg-onyx/40">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-16">
          <p className="text-center text-xs tracking-[0.4em] text-primary mb-8">TRUSTED MARQUES</p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
            {brands.map((b) => (
              <span key={b} className="font-display text-lg md:text-xl text-muted-foreground hover:text-primary transition-colors">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-24 grid gap-8 md:grid-cols-4 text-center">
        {[
          { icon: Trophy, k: "250+", v: "Vehicles delivered" },
          { icon: Globe2, k: "42", v: "Countries served" },
          { icon: Shield, k: "100%", v: "Authenticated" },
          { icon: Sparkles, k: "$2.4B", v: "Traded volume" },
        ].map((s, i) => (
          <motion.div
            key={s.v}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-lg p-8"
          >
            <s.icon className="mx-auto size-6 text-primary mb-4" />
            <div className="font-display text-4xl gold-gradient-text">{s.k}</div>
            <div className="mt-2 text-xs tracking-widest text-muted-foreground uppercase">{s.v}</div>
          </motion.div>
        ))}
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-24">
        <p className="text-center text-xs tracking-[0.3em] text-primary mb-4">CLIENTELE</p>
        <h2 className="text-center font-display text-4xl md:text-5xl mb-16">Words from our <span className="gold-gradient-text italic">patrons</span></h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "The delivery of my Aventador was choreographed like a Swiss watch. Aurelia understands its clientele.", a: "H. Al-Mansouri", r: "Dubai" },
            { q: "I've bought seven cars from Aurelia. Not one surprise. Not one delay. That is the entire proposition.", a: "M. Rossi", r: "Monaco" },
            { q: "My Rolls-Royce Spectre arrived in London before the official European launch. Enough said.", a: "J. Winterbourne", r: "London" },
          ].map((t, i) => (
            <motion.blockquote
              key={t.a}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-lg p-8"
            >
              <p className="text-muted-foreground leading-relaxed italic">"{t.q}"</p>
              <footer className="mt-6 border-t border-border/40 pt-4">
                <div className="text-sm text-primary">{t.a}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-24">
        <div className="glass-panel rounded-2xl p-10 md:p-16 text-center gold-border">
          <p className="text-xs tracking-[0.3em] text-primary mb-4">CANNOT FIND YOUR GRAIL?</p>
          <h3 className="font-display text-3xl md:text-5xl max-w-3xl mx-auto">
            Our sourcing team locates <span className="gold-gradient-text italic">any</span> vehicle, anywhere in the world.
          </h3>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            From an F40 in Maranello to a coachbuilt Rolls-Royce Sweptail. Set a brief with our concierge and we begin the hunt.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-8">
            <Link to="/contact">Contact concierge <ArrowRight className="ml-1 size-4"/></Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
