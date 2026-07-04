import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_messages")
        .select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">Messages</h1>
      {messages.length === 0 ? (
        <div className="glass-panel rounded-lg p-12 text-center text-muted-foreground">No messages yet</div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="glass-panel rounded-lg p-6">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <h3 className="font-display text-lg">{m.name}</h3>
                  <p className="text-xs text-muted-foreground">{m.email} {m.phone && `· ${m.phone}`}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
