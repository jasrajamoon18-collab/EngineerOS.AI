import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

/**
 * Scheduled reminder delivery.
 *
 * Creates in-app notifications from each student's saved preferences.
 * Email and push delivery are NOT implemented — no email service is connected.
 * Requires a bearer cron secret; there is no public access to student data here.
 */
export const Route = createFileRoute("/api/public/reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = await authenticateCronRequest(request);
        if (unauthorized) return unauthorized;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const now = new Date();
        const hour = now.getUTCHours();
        const isMonday = now.getUTCDay() === 1;
        const since = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString();

        const { data: prefs, error } = await supabaseAdmin
          .from("notification_preferences")
          .select("user_id, daily_reminder, weekly_digest, streak_alerts, preferred_hour")
          .eq("preferred_hour", hour);

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        const rows: Array<{
          user_id: string;
          kind: string;
          title: string;
          body: string;
          route: string;
        }> = [];

        for (const pref of prefs ?? []) {
          const { data: recent } = await supabaseAdmin
            .from("notifications")
            .select("kind")
            .eq("user_id", pref.user_id)
            .gte("created_at", since);
          const seen = new Set((recent ?? []).map((row) => row.kind));

          if (pref.daily_reminder && !seen.has("daily")) {
            rows.push({
              user_id: pref.user_id,
              kind: "daily",
              title: "Today's mission is waiting",
              body: "Open your dashboard to see the next best action worked out from your own progress.",
              route: "/dashboard",
            });
          }
          if (pref.streak_alerts && !seen.has("streak")) {
            rows.push({
              user_id: pref.user_id,
              kind: "streak",
              title: "Keep your streak alive",
              body: "Tick off at least one daily task today to keep your streak going.",
              route: "/tasks",
            });
          }
          if (pref.weekly_digest && isMonday && !seen.has("weekly")) {
            rows.push({
              user_id: pref.user_id,
              kind: "weekly",
              title: "Your week in review",
              body: "Check Insights for last week's activity trend and plan the week ahead.",
              route: "/insights",
            });
          }
        }

        if (rows.length) {
          const { error: insertError } = await supabaseAdmin.from("notifications").insert(rows);
          if (insertError) {
            return Response.json({ error: insertError.message }, { status: 500 });
          }
        }

        return Response.json({ created: rows.length, hour });
      },
    },
  },
});
