import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/cars")({
  component: AdminCars,
});

type CarForm = {
  title: string; slug: string; brand: string; year: number; price: number;
  mileage: number; horsepower: number; engine: string; transmission: string;
  top_speed: number; description: string; featured_image: string; featured: boolean;
};

const empty: CarForm = {
  title: "", slug: "", brand: "", year: 2024, price: 100000, mileage: 0,
  horsepower: 500, engine: "", transmission: "", top_speed: 300,
  description: "", featured_image: "/cars/lamborghini.jpg", featured: false,
};

function AdminCars() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CarForm>(empty);

  const { data: cars = [] } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: async () => {
      const { data } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const save = async () => {
    const payload = { ...form, gallery_images: [form.featured_image] };
    const res = editing
      ? await supabase.from("cars").update(payload).eq("id", editing)
      : await supabase.from("cars").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing ? "Vehicle updated" : "Vehicle added");
    qc.invalidateQueries({ queryKey: ["admin-cars"] });
    qc.invalidateQueries({ queryKey: ["cars"] });
    setOpen(false); setEditing(null); setForm(empty);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-cars"] });
  };

  const openEdit = (c: typeof cars[0]) => {
    setEditing(c.id);
    setForm({
      title: c.title, slug: c.slug, brand: c.brand, year: c.year, price: Number(c.price),
      mileage: c.mileage, horsepower: c.horsepower, engine: c.engine, transmission: c.transmission,
      top_speed: c.top_speed, description: c.description, featured_image: c.featured_image, featured: c.featured,
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl">Vehicles</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(empty);}}}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4"/> Add vehicle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit vehicle" : "New vehicle"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Title"><Input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})}/></F>
              <F label="Slug"><Input value={form.slug} onChange={(e)=>setForm({...form, slug:e.target.value})}/></F>
              <F label="Brand"><Input value={form.brand} onChange={(e)=>setForm({...form, brand:e.target.value})}/></F>
              <F label="Year"><Input type="number" value={form.year} onChange={(e)=>setForm({...form, year:+e.target.value})}/></F>
              <F label="Price (USD)"><Input type="number" value={form.price} onChange={(e)=>setForm({...form, price:+e.target.value})}/></F>
              <F label="Mileage (km)"><Input type="number" value={form.mileage} onChange={(e)=>setForm({...form, mileage:+e.target.value})}/></F>
              <F label="Horsepower"><Input type="number" value={form.horsepower} onChange={(e)=>setForm({...form, horsepower:+e.target.value})}/></F>
              <F label="Top speed (km/h)"><Input type="number" value={form.top_speed} onChange={(e)=>setForm({...form, top_speed:+e.target.value})}/></F>
              <F label="Engine"><Input value={form.engine} onChange={(e)=>setForm({...form, engine:e.target.value})}/></F>
              <F label="Transmission"><Input value={form.transmission} onChange={(e)=>setForm({...form, transmission:e.target.value})}/></F>
              <div className="sm:col-span-2"><F label="Featured image URL"><Input value={form.featured_image} onChange={(e)=>setForm({...form, featured_image:e.target.value})}/></F></div>
              <div className="sm:col-span-2"><F label="Description"><Textarea rows={3} value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/></F></div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={form.featured} onChange={(e)=>setForm({...form, featured:e.target.checked})}/>
                Featured on landing page
              </label>
            </div>
            <Button onClick={save} className="mt-4">{editing ? "Update" : "Create"}</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-panel rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="flex items-center gap-3">
                  <img src={c.featured_image} className="size-10 rounded object-cover" alt=""/>
                  <span className="truncate max-w-[220px]">{c.title}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.brand}</TableCell>
                <TableCell className="text-primary">{formatPrice(Number(c.price))}</TableCell>
                <TableCell className="text-muted-foreground">{c.year}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="size-4"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="size-4 text-destructive"/></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs tracking-widest text-muted-foreground">{label.toUpperCase()}</Label><div className="mt-1">{children}</div></div>;
}
