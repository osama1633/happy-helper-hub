import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — OSAMA Private Concierge" },
      { name: "description", content: "Reach the OSAMA concierge team for private sourcing, viewings and delivery." },
      { property: "og:title", content: "Contact OSAMA" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(form);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Message received — our concierge will be in touch");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-24 grid gap-16 md:grid-cols-2">
        <motion.div initial={{opacity:0, y:16}} animate={{opacity:1, y:0}}>
          <p className="text-xs tracking-[0.4em] text-primary">PRIVATE CONCIERGE</p>
          <h1 className="mt-3 font-display text-5xl">Begin the <span className="gold-gradient-text italic">conversation</span></h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Whether you seek a specific model or need us to hunt a rare specification, our team responds within one business hour.
          </p>
          <div className="mt-10 space-y-5 text-sm">
            <div className="flex items-center gap-4"><Phone className="size-4 text-primary"/> +20 122 199 6350</div>
            <div className="flex items-center gap-4"><Mail className="size-4 text-primary"/> concierge@aurelia.co</div>
            <div className="flex items-center gap-4"><MapPin className="size-4 text-primary"/> By appointment · Global delivery</div>
          </div>
        </motion.div>

        <motion.form onSubmit={submit} initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{delay:0.1}}
          className="glass-panel rounded-lg p-8 space-y-5">
          <Field label="Name">
            <Input required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}/>
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})}/>
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})}/>
          </Field>
          <Field label="Message">
            <Textarea rows={5} required value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})}/>
          </Field>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Sending..." : "Send to concierge"}
          </Button>
        </motion.form>
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
