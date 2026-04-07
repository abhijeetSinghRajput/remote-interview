"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlus, IconUsers, IconActivity, IconHistory, IconLoader } from "@tabler/icons-react";
import { toast } from "sonner";
import { createSession, getActiveSession, getMyRecentSessions, joinSession } from "@/services/session.service";
import { ISession } from "@/types/model";
import CreateSessionDialog from "@/components/dashboard/create-session-dialog";
import SessionStatCard from "@/components/dashboard/session-stat-card";

import ActiveSessionsSection from "@/components/dashboard/active-sessions-section";
import RecentSessionsSection from "@/components/dashboard/recent-sessions-section";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data: activeSessions = [], isLoading: activeLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => getActiveSession({ page: 1, limit: 20 }),
    refetchInterval: 15_000, // poll every 15s
    enabled: isLoaded && isSignedIn,
  });

  const { data: recentSessions = [], isLoading: recentLoading } = useQuery({
    queryKey: ["recent-sessions"],
    queryFn: () => getMyRecentSessions({ page: 1, limit: 20 }),
    enabled: isLoaded && isSignedIn,
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      router.push(`/session/${session._id}`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create session";

      toast.error(message);
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinSession,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      router.push(`/session/${id}`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Something went wrong";

      toast.error(message);
    },
    onSettled: () => setJoiningId(null),
  });

  if (!isLoaded) {
    return (<div className="h-dvh flex items-center justify-center">
      <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>)
  }

  const handleJoin = (id: string) => {
    // Find the session object by id
    const session = activeSessions.find((s: ISession) => s._id === id);
    const isHost = session?.host?.clerkId === user?.id;
    if (isHost) {
      router.push(`/session/${id}`);
      return;
    }
    setJoiningId(id);
    joinMutation.mutate(id);
  };

  const stats = [
    {
      label: "Active Now",
      value: activeLoading ? "—" : activeSessions.length,
      icon: IconActivity,
    },
    {
      label: "Past Sessions",
      value: recentLoading ? "—" : recentSessions.length,
      icon: IconHistory,
    },
    {
      label: "Peers Online",
      value: activeLoading
        ? "—"
        : activeSessions.reduce(
          (acc: number, s: ISession) => acc + 1 + (s.participant ? 1 : 0),
          0
        ),
      icon: IconUsers,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold">
              R
            </div>
            <span className="font-semibold tracking-tight">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <IconPlus className="h-3.5 w-3.5" />
              New Session
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <SessionStatCard key={s.label} {...s} />
          ))}
        </div>


        {/* Mobile / tablet: tabs */}
        <div className="lg:hidden space-y-4">
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="live" className="text-xs">
                Live
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-4">
              <ActiveSessionsSection
                sessions={activeSessions}
                isLoading={activeLoading}
                joiningId={joiningId}
                onJoin={handleJoin}
                onCreateClick={() => setCreateOpen(true)}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <RecentSessionsSection
                sessions={recentSessions}
                isLoading={recentLoading}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ActiveSessionsSection
              sessions={activeSessions}
              isLoading={activeLoading}
              joiningId={joiningId}
              onJoin={handleJoin}
              onCreateClick={() => setCreateOpen(true)}
            />
          </div>

          <div className="lg:col-span-2">
            <RecentSessionsSection
              sessions={recentSessions}
              isLoading={recentLoading}
            />
          </div>
        </div>
      </main>

      {/* ── Create Dialog ── */}
      <CreateSessionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(problemId) => createMutation.mutate(problemId)}
        isCreating={createMutation.isPending}
      />
    </div>
  );
}