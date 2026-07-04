import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gauge, Zap } from "lucide-react";
import { formatPrice, formatNumber } from "@/lib/format";

export type CarSummary = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  year: number;
  price: number | string;
  horsepower: number;
  top_speed: number;
  featured_image: string;
};

export function CarCard({ car, index = 0 }: { car: CarSummary; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link
        to="/cars/$slug"
        params={{ slug: car.slug }}
        className="group block overflow-hidden rounded-lg gold-border bg-card"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-onyx">
          <img
            src={car.featured_image}
            alt={car.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 rounded-full bg-onyx/70 px-3 py-1 text-[10px] tracking-widest text-primary gold-border">
            {car.brand.toUpperCase()}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
              {car.title}
            </h3>
            <span className="text-xs text-muted-foreground">{car.year}</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="size-3 text-primary"/>{formatNumber(car.horsepower)} hp</span>
            <span className="flex items-center gap-1"><Gauge className="size-3 text-primary"/>{car.top_speed} km/h</span>
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-border/40 pt-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">From</span>
            <span className="font-display text-xl gold-gradient-text">{formatPrice(car.price)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
