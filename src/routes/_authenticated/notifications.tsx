import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BellOff, Check } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { notificationPreferencesQuery, notificationsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Reminders — EngineerOS" },
      {
        name: "description",
        content: "In-app notifications and reminder preferences for tasks, streaks and digests.",
      },
      { property: "og:title", content: "Notifications & Reminders — EngineerOS" },
      { property: "og:description", content: "User-controlled reminders, no spam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery(notificationsQuery(user?.id));
  const { data: prefs } = useQuery(notificationPreferencesQuery(user?.id));
  const [daily, setDaily] = useState(true);
  const [weekly, setWeekly] = useState(true);
  const [streak, setStreak] = useState(true);
  const [hour, setHour] = useState(18);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      setDaily(prefs.daily_reminder);
      setWeekly(prefs.weekly_digest);
      setStreak(prefs.streak_alerts);
      setHour(prefs.preferred_hour);
    }
  }, [prefs]);

  async function markRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user!.id);
    if (error) toast.error(error.message);
    await queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  }

  async function markAllRead() {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user!.id)
      .is("read_at", null);
    if (error) toast.error(error.message);
    await queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  }

  async function savePrefs() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      daily_reminder: daily,
      weekly_digest: weekly,
      streak_alerts: streak,
      preferred_hour: hour,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Preferences saved.");
      await queryClient.invalidateQueries({ queryKey: ["notification-preferences", user.id] });
    }
  }

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <>
      <PageHeader
        eyebrow="Signals"
        title="Notifications & Reminders"
        description="Reminders appear here in the app, on the schedule you set below. Email and push are not sent — that needs an email service connected first."
        actions={
          unread > 0 ? (
            <Button variant="outline" onClick={markAllRead}>
              <Check className="h-4 w-4" aria-hidden="true" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Notifications" className="space-y-3">
          {notifications.length === 0 ? (
            <div className="panel p-6 text-center">
              <BellOff className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing yet. Milestones, group activity and reminders will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <article
                key={n.id}
                className={cn("panel p-4", !n.read_at && "border-primary/60")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold">{n.title}</h2>
                      {!n.read_at ? <Badge className="label-mono">New</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    <p className="label-mono mt-2 text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {n.route ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={n.route}>Open</Link>
                      </Button>
                    ) : null}
                    {!n.read_at ? (
                      <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <section aria-label="Reminder preferences" className="panel h-fit space-y-4 p-5">
          <h2 className="font-semibold">Reminder preferences</h2>
          <p className="text-sm text-muted-foreground">
            Stored per-account and editable any time. Nothing is sent without you opting in here.
          </p>
          {[
            { label: "Daily task reminder", value: daily, set: setDaily },
            { label: "Weekly progress digest", value: weekly, set: setWeekly },
            { label: "Streak risk alerts", value: streak, set: setStreak },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between gap-3 text-sm">
              {item.label}
              <input
                type="checkbox"
                checked={item.value}
                onChange={(e) => item.set(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
            </label>
          ))}
          <label className="flex items-center justify-between gap-3 text-sm">
            Preferred reminder hour
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <Button onClick={savePrefs} disabled={saving}>
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </section>
      </div>
    </>
  );
}
