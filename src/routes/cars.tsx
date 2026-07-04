import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { CarCard, type CarSummary } from "@/components/car-card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

export const Route = createFileRoute("/cars")({
  head: () => ({
    meta: [
      { title: "Collection — Aurelia Motors" },
      { name: "description", content: "Browse our full curated collection of luxury automobiles. Filter by brand, price and year." },
      { property: "og:title", content: "The Collection — Aurelia Motors" },
    ],
  }),
  component: CarsPage,
});

const BRANDS = ["Lamborghini","Ferrari","Rolls Royce","Bentley","Porsche","McLaren","Mercedes AMG","BMW M","Audi RS","Aston Martin"];
const PAGE_SIZE = 9;

function CarsPage() {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(700_000);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: async (): Promise<CarSummary[]> => {
      const { data, error } = await supabase
        .from("cars")
        .select("id,slug,title,brand,year,price,horsepower,top_speed,featured_image")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CarSummary[];
    },
  });

  const filtered = useMemo(() => {
    let list = cars.filter((c) => {
      if (brand !== "all" && c.brand !== brand) return false;
      if (Number(c.price) > maxPrice) return false;
      if (q && !`${c.title} ${c.brand}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a,b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") list = [...list].sort((a,b) => Number(b.price) - Number(a.price));
    if (sort === "year-desc") list = [...list].sort((a,b) => b.year - a.year);
    return list;
  }, [cars, brand, maxPrice, q, sort]);

  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.4em] text-primary mb-3">THE COLLECTION</p>
          <h1 className="font-display text-4xl md:text-6xl">Every marque. <span className="gold-gradient-text italic">One address.</span></h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">Currently curating {cars.length} vehicles across ten legendary manufacturers.</p>
        </motion.div>

        {/* FILTERS */}
        <div className="mt-10 glass-panel rounded-lg p-6 grid gap-6 md:grid-cols-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs tracking-widest text-muted-foreground">SEARCH</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => {setPage(0); setQ(e.target.value);}} placeholder="Search by name or brand..." className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs tracking-widest text-muted-foreground">BRAND</label>
            <Select value={brand} onValueChange={(v) => {setPage(0); setBrand(v);}}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs tracking-widest text-muted-foreground">SORT</label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price ↑</SelectItem>
                <SelectItem value="price-desc">Price ↓</SelectItem>
                <SelectItem value="year-desc">Year ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <div className="flex justify-between text-xs tracking-widest text-muted-foreground">
              <span>MAX PRICE</span>
              <span className="text-primary">${maxPrice.toLocaleString()}</span>
            </div>
            <Slider value={[maxPrice]} min={100_000} max={700_000} step={10_000}
              onValueChange={(v) => {setPage(0); setMaxPrice(v[0]);}} className="mt-3"/>
          </div>
        </div>

        {/* RESULTS */}
        {isLoading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading...</div>
        ) : paged.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground py-20">No vehicles match your filters.</div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((c, i) => <CarCard key={c.id} car={c} index={i}/>)}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`size-9 rounded-full text-sm transition-colors ${i === page ? "bg-primary text-primary-foreground" : "gold-border text-muted-foreground hover:text-primary"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
