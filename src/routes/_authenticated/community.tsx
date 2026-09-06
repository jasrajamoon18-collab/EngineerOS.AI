import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send, Users } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { groupDetailQuery, studyGroupsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community & Study Groups — EngineerOS" },
      {
        name: "description",
        content: "Join or create study groups, share progress updates and resources with peers.",
      },
      { property: "og:title", content: "Community & Study Groups — EngineerOS" },
      { property: "og:description", content: "Peer study groups with privacy-first membership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityPage,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function CommunityPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("general");
  const [postText, setPostText] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery(studyGroupsQuery(user?.id));
  const { data: detail } = useQuery(groupDetailQuery(selectedId ?? undefined, user?.id));

  const memberships = new Set((data?.memberships ?? []).map((m) => m.group_id));
  const countByGroup = new Map<string, number>();
  for (const m of data?.memberCounts ?? []) {
    countByGroup.set(m.group_id, (countByGroup.get(m.group_id) ?? 0) + 1);
  }

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["study-groups", user?.id] });
    await queryClient.invalidateQueries({ queryKey: ["study-group", selectedId] });
  }

  async function createGroup() {
    if (!user || !name.trim()) return;
    setBusy(true);
    try {
      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
      const created = await supabase
        .from("study_groups")
        .insert({ slug, name: name.trim(), description: description.trim(), focus, created_by: user.id })
        .select("id")
        .single();
      if (created.error) throw new Error(created.error.message);
      const joined = await supabase
        .from("group_members")
        .insert({ group_id: created.data.id, user_id: user.id, member_role: "owner" });
      if (joined.error) throw new Error(joined.error.message);
      toast.success("Group created.");
      setCreating(false);
      setName("");
      setDescription("");
      setSelectedId(created.data.id);
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create group.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleMembership(groupId: string, join: boolean) {
    if (!user) return;
    setBusy(true);
    try {
      if (join) {
        const { error } = await supabase
          .from("group_members")
          .insert({ group_id: groupId, user_id: user.id });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("group_members")
          .delete()
          .eq("group_id", groupId)
          .eq("user_id", user.id);
        if (error) throw new Error(error.message);
      }
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Membership change failed.");
    } finally {
      setBusy(false);
    }
  }

  async function addPost() {
    if (!user || !selectedId || !postText.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("group_posts").insert({
        group_id: selectedId,
        user_id: user.id,
        content: postText.trim(),
      });
      if (error) throw new Error(error.message);
      setPostText("");
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Study Groups"
        description="Peer groups for accountability. Groups you create are public to signed-in students; posts are visible to members only. No leaderboards, no public ranking — your progress stays yours."
        actions={
          <Button onClick={() => setCreating((v) => !v)} variant={creating ? "outline" : "default"}>
            {creating ? "Cancel" : "New group"}
          </Button>
        }
      />

      {creating ? (
        <section className="panel mb-6 space-y-3 p-5" aria-label="Create a study group">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="group-name" className="label-mono mb-1 block text-muted-foreground">
                Name
              </label>
              <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
            <div>
              <label htmlFor="group-focus" className="label-mono mb-1 block text-muted-foreground">
                Focus
              </label>
              <select
                id="group-focus"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="general">General</option>
                <option value="dsa">DSA & placement</option>
                <option value="programming">Programming</option>
                <option value="linux">Linux</option>
                <option value="projects">Projects</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="group-desc" className="label-mono mb-1 block text-muted-foreground">
              Description
            </label>
            <Textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>
          <Button onClick={createGroup} disabled={busy || !name.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Create group
          </Button>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="All study groups" className="space-y-3">
          {isLoading ? (
            <p className="label-mono text-muted-foreground">Loading groups…</p>
          ) : (data?.groups ?? []).length === 0 ? (
            <div className="panel p-6 text-center">
              <Users className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">
                No groups yet. Create the first one for your batch or branch.
              </p>
            </div>
          ) : (
            (data?.groups ?? []).map((group) => {
              const joined = memberships.has(group.id);
              return (
                <article
                  key={group.id}
                  className={cn(
                    "panel cursor-pointer p-4 transition-colors hover:border-primary/50",
                    selectedId === group.id && "border-primary",
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedId(group.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-semibold">{group.name}</h2>
                      <Badge variant="outline" className="label-mono">
                        {group.focus}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
                    <p className="label-mono mt-2 text-muted-foreground">
                      {countByGroup.get(group.id) ?? 0} member{(countByGroup.get(group.id) ?? 0) === 1 ? "" : "s"}
                    </p>
                  </button>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant={joined ? "outline" : "default"}
                      disabled={busy}
                      onClick={() => toggleMembership(group.id, !joined)}
                    >
                      {joined ? "Leave" : "Join"}
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section aria-label="Group discussion" className="panel flex min-h-[320px] flex-col p-5">
          {!selectedId || !detail ? (
            <p className="m-auto text-sm text-muted-foreground">
              Select a group to see its discussion.
            </p>
          ) : !detail.isMember ? (
            <p className="m-auto text-sm text-muted-foreground">
              Join {detail.group.name} to read and post updates.
            </p>
          ) : (
            <>
              <h2 className="mb-3 font-semibold">{detail.group.name} — updates</h2>
              <div className="flex-1 space-y-3 overflow-y-auto" aria-live="polite">
                {detail.posts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No posts yet. Share what you're working on this week.
                  </p>
                ) : (
                  detail.posts.map((post) => (
                    <div key={post.id} className="rounded-lg border border-border bg-surface p-3">
                      <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                      <p className="label-mono mt-2 text-muted-foreground">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <form
                className="mt-4 flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void addPost();
                }}
              >
                <label htmlFor="group-post" className="sr-only">
                  Post an update
                </label>
                <Textarea
                  id="group-post"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="Share a progress update, resource or question…"
                  className="min-h-[44px] resize-none"
                />
                <Button type="submit" disabled={busy || !postText.trim()} aria-label="Post update">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}
