"use client";
import CodeEditorPanel from "@/app/(public)/problems/[slug]/code-editor-panel";
import OutputPanel from "@/app/(public)/problems/[slug]/output-panel";
import ProblemPanel from "@/app/(public)/problems/[slug]/problem-panel";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import { endSession, getSessionById, joinSession } from "@/services/session.service";
import { ISession, ISessionDetail } from "@/types/model";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  IconCode,
  IconFileText,
  IconLoader,
  IconMessageCircle,
  IconTerminal2,
  IconVideo,
} from "@tabler/icons-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { toast } from "sonner";
import useStreamClient from "@/hooks/useStreamClient";
import EndSessionButton from "@/components/session/end-session-button";
import VideoCallPanel from "@/components/session/video-call-pannel";

const TABS = [
  { id: "problem", label: "Problem", icon: IconFileText },
  { id: "code", label: "Code", icon: IconCode },
  { id: "output", label: "Output", icon: IconTerminal2 },
  { id: "video", label: "Video", icon: IconVideo },
  { id: "chat", label: "Chat", icon: IconMessageCircle },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("problem");
  const { user, isLoaded } = useUser();

  const { data: currentSession, isLoading, isError, error } = useQuery<ISessionDetail>({
    queryKey: ["problem", sessionId],
    queryFn: () => getSessionById(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60_000,
  });

  const { host, problem } = currentSession || {};
  const isHost = user?.id === host?.clerkId;
  const isParticipant = typeof currentSession?.participant === "object" && user?.id === currentSession.participant.clerkId;

  const {
    streamClient,
    call,
    chatClient,
    channel,
    isLoading: isInitializingCall,
  } = useStreamClient(currentSession as ISession, isLoading, isHost, isParticipant);

  const joinSessionMutation = useMutation({
    mutationKey: ["join-session", sessionId],
    mutationFn: (id: string) => joinSession(id),
    onSuccess: () => toast.success("Joined session successfully"),
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to join session";
      toast.error(message);
    }
  });

  const endSessionMutation = useMutation({
    mutationKey: ["end-session", sessionId],
    mutationFn: (id: string) => endSession(id),
    onSuccess: () => {
      // navigate back to dashboard after ending session
      router.push("/dashboard");
    }
  });


  // auto join the session if user is not host or participant
  useEffect(() => {
    if (!isLoaded || !user || !currentSession) return;
    if (isHost || isParticipant) return;
    joinSessionMutation.mutate(sessionId);
  }, [sessionId, user, isLoaded, currentSession]);

  useEffect(() => {
    if (!currentSession || isLoading) return;
    if (currentSession.status !== "active") {
      //navigate to dashboard if session is no longer active
      router.push("/dashboard");
    }
  }, [currentSession]);

  if (!isLoaded) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <IconLoader className="size-5 animate-spin" />
      </div>
    );
  }

  const handleRun = async (code: string, language: string) => { };
  const handleSubmit = async (code: string, language: string) => { };

  return (
    <div className="flex flex-col h-dvh">
      {/* ── Header ── */}
      <header className="flex justify-between items-center px-4 py-1.5 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold">
              R
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EndSessionButton
            onConfim={() => endSessionMutation.mutate(sessionId)}
            isLoading={endSessionMutation.isPending}
            isHost={isHost}
          />
          <ModeToggle />
          <UserButton />
        </div>
      </header>

      {/* ── Desktop: Resizable Panels ── */}
      <div className="hidden md:flex flex-1 min-h-0">
        <Group orientation="horizontal" className="flex-1 p-2 gap-2">
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full rounded-lg border overflow-hidden">
              <ProblemPanel
                problem={problem ?? null}
                isLoading={isLoading}
                isError={isError}
                error={error}
              />
            </div>
          </Panel>

          <Separator className="w-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

          <Panel defaultSize={60} minSize={30}>
            <Group orientation="vertical" className="gap-2">
              <Panel defaultSize={65} minSize={40}>
                <div className="h-full rounded-lg border overflow-hidden">
                  <CodeEditorPanel
                    codeStubs={problem?.codeStubs}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                  />
                </div>
              </Panel>

              <Separator className="h-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

              <Panel defaultSize={35} minSize={15}>
                <div className="h-full rounded-lg border overflow-hidden">
                  <OutputPanel />
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      {/* ── Mobile: Tab Layout ── */}
      <div className="flex md:hidden flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className={cn("h-full overflow-hidden", activeTab !== "problem" && "hidden")}>
            <ProblemPanel
              problem={problem ?? null}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          </div>

          <div className={cn("h-full overflow-hidden", activeTab !== "code" && "hidden")}>
            <CodeEditorPanel
              codeStubs={problem?.codeStubs}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </div>

          <div className={cn("h-full overflow-hidden", activeTab !== "output" && "hidden")}>
            <OutputPanel />
          </div>
          <div className={cn("h-full overflow-hidden", activeTab !== "video" && "hidden")}>
            <VideoCallPanel
              isLoading={isInitializingCall}
              streamClient={streamClient}
              call={call}
              chatClient={chatClient}
              channel={channel}
            />

          </div>
          <div className={cn("h-full overflow-hidden", activeTab !== "chat" && "hidden")}>
            Chat Panel
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav className="shrink-0 flex border-t bg-background">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 pt-4 pb-6 text-xs font-medium transition-colors",
                activeTab === id
                  ? "text-primary border-t-2 border-primary -mt-px"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}