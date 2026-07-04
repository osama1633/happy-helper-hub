import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Aurelia Motors" },
      { name: "description", content: "Aurelia Motors is a private atelier trading the world's most exceptional automobiles." },
      { property: "og:title", content: "About Aurelia Motors" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-24">
        <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-xs tracking-[0.4em] text-primary">ABOUT</motion.p>
        <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="mt-3 font-display text-5xl md:text-7xl">
          Discretion. <span className="gold-gradient-text italic">Excellence.</span> Delivery.
        </motion.h1>
        <div className="mt-12 grid gap-10 md:grid-cols-2 text-muted-foreground leading-relaxed">
          <p>Founded on the principle that acquiring an exceptional automobile should be as memorable as owning one, Aurelia Motors operates a private atelier serving collectors, connoisseurs and heads of state across four continents.</p>
          <p>Every vehicle in our collection is personally inspected by a master technician, provenance-verified, and delivered by our concierge team on white-glove protocols. We do not run public showrooms. We do not advertise. Our clients find us through their peers.</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            { k: "12yrs", v: "Serving collectors" },
            { k: "42", v: "Countries delivered" },
            { k: "$2.4B", v: "Traded volume" },
          ].map((s) => (
            <div key={s.v} className="glass-panel rounded-lg p-8 text-center">
              <div className="font-display text-4xl gold-gradient-text">{s.k}</div>
              <div className="mt-2 text-xs tracking-widest text-muted-foreground uppercase">{s.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/contact">Speak with concierge</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
