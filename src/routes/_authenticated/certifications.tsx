import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { certificationPlansQuery, certificationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/certifications")({
  head: () => ({
    meta: [
      { title: "Certifications Planner — EngineerOS" },
      {
        name: "description",
        content:
          "Plan which industry certifications to attempt, set a target date and track your own study status.",
      },
      { property: "og:title", content: "Certifications Planner — EngineerOS" },
      {
        property: "og:description",
        content: "Plan and track external certifications you intend to earn.",
      },
    ],
  }),
  component: CertificationsPage,
});

const STATUSES = ["planned", "studying", "scheduled", "passed", "dropped"] as const;
type PlanStatus = (typeof STATUSES)[number];

function CertificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: catalogue = [] } = useQuery(certificationsQuery());
  const { data: plans = [] } = useQuery(certificationPlansQuery(user?.id));

  const planByCert = new Map(plans.map((plan) => [plan.certification_id, plan]));
  const passed = plans.filter((plan) => plan.status === "passed").length;
  const active = plans.filter(
    (plan) => plan.status === "studying" || plan.status === "scheduled",
  ).length;

  async function upsert(certificationId: string, patch: Record<string, unknown>) {
    if (!user) return;
    const existing = planByCert.get(certificationId);
    const { error } = await supabase.from("certification_plans").upsert(
      {
        ...(existing ? { id: existing.id } : {}),
        user_id: user.id,
        certification_id: certificationId,
        status: existing?.status ?? "planned",
        target_date: existing?.target_date ?? null,
        ...patch,
      },
      { onConflict: "user_id,certification_id" },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["certification-plans", user.id] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("certification_plans").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["certification-plans", user?.id] });
  }

  const domains = [...new Set(catalogue.map((item) => item.domain))];

  return (
    <>
      <PageHeader
        eyebrow="Growth"
        title="Certifications Planner"
        description="Choose a small number of credentials that actually match your goal, and give each one a date."
        actions={
          <div className="min-w-[200px]">
            <p className="label-mono text-muted-foreground">
              {passed} passed · {active} in progress
            </p>
            <Progress
              className="mt-2 h-1.5"
              value={catalogue.length ? (plans.length / catalogue.length) * 100 : 0}
            />
          </div>
        }
      />

      <Alert className="mb-8">
        <AlertTitle>EngineerOS does not issue or verify certificates</AlertTitle>
        <AlertDescription>
          Every credential here is awarded by an external provider. We link to the official page;
          statuses below are your own notes and are never presented as proof of a qualification.
        </AlertDescription>
      </Alert>

      <div className="space-y-10">
        {domains.map((domain) => (
          <section key={domain} aria-labelledby={`domain-${domain}`}>
            <h2 id={`domain-${domain}`} className="label-mono mb-3 text-primary">
              {domain}
            </h2>
            <ul className="space-y-4">
              {catalogue
                .filter((item) => item.domain === domain)
                .map((cert) => {
                  const plan = planByCert.get(cert.id);
                  return (
                    <li key={cert.id} className="panel p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{cert.title}</h3>
                        <Badge variant="outline" className="label-mono">
                          {cert.provider}
                        </Badge>
                        <Badge variant="outline" className="label-mono">
                          {cert.level}
                        </Badge>
                        <Badge variant="outline" className="label-mono">
                          ~{cert.est_hours}h
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{cert.summary}</p>

                      <div className="mt-4 flex flex-wrap items-end gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`status-${cert.id}`} className="label-mono">
                            Your status
                          </Label>
                          <Select
                            value={plan?.status ?? "none"}
                            onValueChange={(value) =>
                              value === "none"
                                ? plan
                                  ? remove(plan.id)
                                  : undefined
                                : upsert(cert.id, { status: value as PlanStatus })
                            }
                          >
                            <SelectTrigger id={`status-${cert.id}`} className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">not planned</SelectItem>
                              {STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`date-${cert.id}`} className="label-mono">
                            Target date
                          </Label>
                          <Input
                            id={`date-${cert.id}`}
                            type="date"
                            className="w-[170px]"
                            value={plan?.target_date ?? ""}
                            onChange={(e) =>
                              upsert(cert.id, { target_date: e.target.value || null })
                            }
                          />
                        </div>

                        {cert.url ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={cert.url} target="_blank" rel="noreferrer noopener">
                              Official page
                              <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
