import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gauge, MessageCircle, Zap } from "lucide-react";
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
  const price = Number(car.price);
  const whatsappUrl = `https://wa.me/201221996350?text=${encodeURIComponent(
    `Hello Osama,

I would like to buy / reserve this car:
${car.title}
Price: ${formatPrice(price)}

Please contact me with more details.`,
  )}`;


  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: "easeOut" }}
      className="group overflow-hidden rounded-lg gold-border bg-card"
    >
      <Link
        to="/cars/$slug"
        params={{ slug: car.slug }}
        className="block"
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
      </Link>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <Link to="/cars/$slug" params={{ slug: car.slug }} className="min-w-0">
            <h3 className="font-display text-lg leading-tight text-foreground transition-colors hover:text-primary">
              {car.title}
            </h3>
          </Link>
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
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buy ${car.title} on WhatsApp`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <MessageCircle className="size-4" />
          Buy / Reserve on WhatsApp
        </a>

      </div>
    </motion.article>
  );
}
