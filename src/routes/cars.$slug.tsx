import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, ShieldCheck, Zap, Gauge, Cog, Calendar, CircleGauge } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { CarCard, type CarSummary } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatNumber } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/cars/$slug")({
  component: CarDetail,
  errorComponent: ({ error }) => (
    <PageShell><div className="p-20 text-center text-destructive">{error.message}</div></PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <div className="p-20 text-center">
        <h2 className="font-display text-3xl">Vehicle not found</h2>
        <Button asChild className="mt-6"><Link to="/cars">Back to collection</Link></Button>
      </div>
    </PageShell>
  ),
});

function CarDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [activeImg, setActiveImg] = useState(0);
  const [wishing, setWishing] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("cars").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related", car?.brand, car?.id],
    enabled: !!car,
    queryFn: async (): Promise<CarSummary[]> => {
      const { data } = await supabase.from("cars")
        .select("id,slug,title,brand,year,price,horsepower,top_speed,featured_image")
        .eq("brand", car!.brand).neq("id", car!.id).limit(3);
      return (data ?? []) as unknown as CarSummary[];
    },
  });

  if (isLoading || !car) {
    return <PageShell><div className="p-20 text-center text-muted-foreground">Loading...</div></PageShell>;
  }

  const gallery = car.gallery_images?.length ? car.gallery_images : [car.featured_image];
  const price = Number(car.price);

  const whatsappUrl = `https://wa.me/201221996350?text=${encodeURIComponent(
    `السلام عليكم أسامة،\n\nأنا مهتم بشراء / حجز السيارة التالية:\n\n🚗 السيارة: ${car.title}\n🏷️ الماركة: ${car.brand}\n📅 السنة: ${car.year}\n💰 السعر: ${formatPrice(price)}\n⚡ القوة: ${formatNumber(car.horsepower)} حصان\n🏁 السرعة القصوى: ${car.top_speed} كم/س\n⚙️ المحرك: ${car.engine}\n🔧 ناقل الحركة: ${car.transmission}\n📊 المسافة المقطوعة: ${formatNumber(car.mileage)} كم\n\nياريت تتواصل معايا لتأكيد التفاصيل وطريقة الدفع. شكراً لك.`,
  )}`;


  const toggleWish = async () => {
    if (!user) { toast.error("Please sign in to save vehicles"); return; }
    setWishing(true);
    const { error } = await supabase.from("wishlist").insert({ user_id: user.id, car_id: car.id });
    setWishing(false);
    if (error) toast.error(error.message.includes("duplicate") ? "Already in wishlist" : error.message);
    else toast.success("Added to your wishlist");
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        <Link to="/cars" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4"/> Back to collection
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <motion.div layoutId={`car-${car.id}`} className="aspect-[16/10] overflow-hidden rounded-lg gold-border bg-onyx">
              <img src={gallery[activeImg]} alt={car.title} className="h-full w-full object-cover" />
            </motion.div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`aspect-[16/10] overflow-hidden rounded transition-all ${i===activeImg ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"}`}>
                    <img src={g} alt="" loading="lazy" className="h-full w-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs tracking-[0.4em] text-primary">{car.brand.toUpperCase()} · {car.year}</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">{car.title}</h1>
            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-display text-4xl gold-gradient-text">{formatPrice(price)}</span>
              {car.available && <span className="text-xs text-primary tracking-widest">AVAILABLE NOW</span>}
            </div>

            <p className="mt-6 text-muted-foreground leading-relaxed">{car.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Spec icon={Zap} label="Horsepower" value={`${formatNumber(car.horsepower)} hp`}/>
              <Spec icon={Gauge} label="Top Speed" value={`${car.top_speed} km/h`}/>
              <Spec icon={Cog} label="Engine" value={car.engine}/>
              <Spec icon={CircleGauge} label="Transmission" value={car.transmission}/>
              <Spec icon={Calendar} label="Year" value={String(car.year)}/>
              <Spec icon={CircleGauge} label="Mileage" value={`${formatNumber(car.mileage)} km`}/>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 px-8 flex-1 text-base font-semibold shadow-lg">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-5"/> شراء / طلب على واتساب
                </a>
              </Button>

              <Button size="lg" variant="outline" className="h-14 gold-border" onClick={toggleWish} disabled={wishing}>
                <Heart className="size-4"/>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center sm:text-right">
              اضغط الزر لإرسال طلبك على واتساب أسامة مع كل مواصفات السيارة وسعرها جاهزة.
            </p>



            <div className="mt-8 glass-panel rounded-lg p-5 flex gap-4 items-start">
              <ShieldCheck className="size-6 text-primary flex-shrink-0 mt-1"/>
              <div className="text-sm">
                <p className="font-medium">Financing available</p>
                <p className="text-muted-foreground mt-1">
                  Flexible plans from {formatPrice(price / 60)}/mo over 60 months. Concierge team handles all paperwork.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-3xl mb-8">More from <span className="gold-gradient-text italic">{car.brand}</span></h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((c, i) => <CarCard key={c.id} car={c} index={i}/>)}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function Spec({ icon: Icon, label, value }: { icon: React.ComponentType<{className?: string}>; label: string; value: string }) {
  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground">
        <Icon className="size-3 text-primary"/> {label.toUpperCase()}
      </div>
      <div className="mt-2 font-display text-lg">{value}</div>
    </div>
  );
}
