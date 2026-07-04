import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — OSAMA" },
      { name: "description", content: "Sign in to OSAMA to save vehicles and manage orders." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back");
    navigate({ to: "/" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created — you can now sign in");
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-lg p-8">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.4em] text-primary">MEMBER ACCESS</p>
            <h1 className="mt-2 font-display text-3xl">Welcome to OSAMA</h1>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <Field label="Email">
                  <Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <Input type={show ? "text" : "password"} required value={password} onChange={(e)=>setPassword(e.target.value)} />
                    <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {show ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                    </button>
                  </div>
                </Field>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Field label="Name">
                  <Input required value={name} onChange={(e)=>setName(e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                </Field>
                <Field label="Password">
                  <Input type="password" minLength={8} required value={password} onChange={(e)=>setPassword(e.target.value)} />
                </Field>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40"/></div>
            <span className="relative bg-card px-3 text-xs text-muted-foreground tracking-widest">OR CONTINUE WITH</span>
          </div>
          <Button variant="outline" className="w-full h-11 gold-border" onClick={handleGoogle}>
            Continue with Google
          </Button>
        </motion.div>
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
