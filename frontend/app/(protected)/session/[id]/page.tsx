"use client";

import CodeEditorPanel from "@/app/(public)/problems/[slug]/code-editor-panel";
import OutputPanel from "@/app/(public)/problems/[slug]/output-panel";
import ProblemPanel from "@/app/(public)/problems/[slug]/problem-panel";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import { endSession, getSessionById, joinSession } from "@/services/session.service";
import { fetchProblemDetail } from "@/services/problem.service";
import { ISession, ISessionDetail } from "@/types/model";
import type { ProblemDetail } from "@/types/problem";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  IconCode,
  IconFileText,
  IconLoader,
  IconMessageCircle,
  IconMessageCircleFilled,
  IconTerminal2,
  IconVideo,
  IconVideoFilled,
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
import ChatPanel from "@/components/session/chat-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isLeavingSession, setIsLeavingSession] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [mediumProblemTab, setMediumProblemTab] = useState<"description" | "video">("description");
  const [desktopRightPanel, setDesktopRightPanel] = useState<"video" | "chat" | null>("video");

  const toggleDesktopRightPanel = (panel: "video" | "chat") => {
    setDesktopRightPanel((prev) => (prev === panel ? null : panel));
  };

  const { user, isLoaded } = useUser();

  const {
    data: currentSession,
    isLoading: isSessionLoading,
    isError: isSessionError,
    error: sessionError,
  } = useQuery<ISessionDetail>({
    queryKey: ["session", sessionId],
    queryFn: () => getSessionById(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60_000,
  });

  const { host, problem: sessionProblem } = currentSession || {};
  const isHost = Boolean(user?.id && host?.clerkId && user.id === host.clerkId);
  const isParticipant = Boolean(
  user?.id &&
  currentSession?.participant &&
  typeof currentSession.participant === "object" &&
  user.id === currentSession.participant.clerkId
);

  const {
    data: fullProblem,
    isLoading: isProblemLoading,
    isError: isProblemError,
    error: problemError,
    refetch: refetchProblem,
  } = useQuery<ProblemDetail>({
    queryKey: ["problem-detail", sessionProblem?.titleSlug],
    queryFn: () => fetchProblemDetail(sessionProblem!.titleSlug),
    enabled: !!sessionProblem?.titleSlug,
    staleTime: 5 * 60_000,
  });

  const {
    streamClient,
    call,
    chatClient,
    channel,
    isLoading: isInitializingCall,
  } = useStreamClient(currentSession as ISession, isSessionLoading, isHost, isParticipant);

  const joinSessionMutation = useMutation({
    mutationKey: ["join-session", sessionId],
    mutationFn: (id: string) => joinSession(id),
    onSuccess: () => toast.success("Joined session successfully"),
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to join session";
      toast.error(message);
    },
  });

  const endSessionMutation = useMutation({
    mutationKey: ["end-session", sessionId],
    mutationFn: async (id: string) => {
      setIsLeavingSession(true);
      return endSession(id);
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: () => {
      setIsLeavingSession(false);
    },
  });

  useEffect(() => {
    if (!isLoaded || !user || !currentSession) return;
    if (isHost || isParticipant) return;
    joinSessionMutation.mutate(sessionId);
  }, [
    sessionId,
    user,
    isLoaded,
    currentSession,
    isHost,
    isParticipant,
    joinSessionMutation,
  ]);

  useEffect(() => {
    if (!currentSession || isSessionLoading) return;
    if (currentSession.status !== "active") {
      router.push("/dashboard");
    }
  }, [currentSession, isSessionLoading, router]);

  if (!isLoaded) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <IconLoader className="size-5 animate-spin" />
      </div>
    );
  }

  const combinedLoading = isSessionLoading || isProblemLoading;
  const combinedError = isSessionError || isProblemError;
  const combinedErrorValue =
    (problemError as Error | null) ?? (sessionError as Error | null) ?? null;

  const handleRun = async (_code: string, _language: string) => { };
  const handleSubmit = async (_code: string, _language: string) => { };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold"
            >
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

      <div className="hidden flex-1 min-h-0 gap-2 p-2 md:flex lg:hidden">
        <Group orientation="horizontal" className="flex-1 h-full gap-2">
          <Panel defaultSize={36} minSize={28}>
            <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2">
                <Tabs
                  value={mediumProblemTab}
                  onValueChange={(v) => setMediumProblemTab(v as "description" | "video")}
                >
                  <TabsList className="grid w-62.5 grid-cols-2">
                    <TabsTrigger value="description">
                      <IconFileText className="mr-1.5 h-4 w-4" />
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="video">
                      <IconVideo className="mr-1.5 h-4 w-4" />
                      Video
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setChatSheetOpen(true)}
                >
                  <IconMessageCircle className="h-4 w-4" />
                  Chat
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {mediumProblemTab === "description" ? (
                  <div className="h-full">
                    <ProblemPanel
                      problem={fullProblem ?? null}
                      isLoading={combinedLoading}
                      isError={combinedError}
                      error={combinedErrorValue}
                      onRetry={() => refetchProblem()}
                    />
                  </div>
                ) : (
                  <div className="h-full">
                    {!isLeavingSession && (
                      <VideoCallPanel
                        isLoading={isInitializingCall}
                        streamClient={streamClient}
                        call={call}
                        chatClient={chatClient}
                        channel={channel}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Separator className="w-1.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/30 active:bg-primary" />

          <Panel defaultSize={64} minSize={40}>
            <Group orientation="vertical" className="h-full gap-2">
              <Panel defaultSize={62} minSize={38}>
                <div className="h-full overflow-hidden rounded-xl border bg-card">
                  <CodeEditorPanel
                    codeSnippets={fullProblem?.codeSnippets}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                  />
                </div>
              </Panel>

              <Separator className="h-1.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/30 active:bg-primary" />

              <Panel defaultSize={38} minSize={24}>
                <div className="h-full overflow-hidden rounded-xl border bg-card">
                  <OutputPanel />
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>

        <Sheet open={chatSheetOpen} onOpenChange={setChatSheetOpen}>
          <SheetContent side="left" className="w-95 p-0 sm:w-105">
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>Session Chat</SheetTitle>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-hidden">
                {!isLeavingSession && (
                  <ChatPanel chatClient={chatClient} channel={channel} />
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden flex-1 min-h-0 gap-2 p-2 lg:flex">
        <div className="min-w-0 flex-1">
          <Group orientation="horizontal" className="h-full gap-2">
            <Panel defaultSize={34} minSize={24}>
              <div className="h-full overflow-hidden rounded-xl border bg-card">
                <ProblemPanel
                  problem={fullProblem ?? null}
                  isLoading={combinedLoading}
                  isError={combinedError}
                  error={combinedErrorValue}
                  onRetry={() => refetchProblem()}
                />
              </div>
            </Panel>

            <Separator className="w-1.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/30 active:bg-primary" />

            <Panel defaultSize={66} minSize={38}>
              <Group orientation="vertical" className="h-full gap-2">
                <Panel defaultSize={68} minSize={42}>
                  <div className="h-full overflow-hidden rounded-xl border bg-card">
                    <CodeEditorPanel
                      codeSnippets={fullProblem?.codeSnippets}
                      onRun={handleRun}
                      onSubmit={handleSubmit}
                    />
                  </div>
                </Panel>

                <Separator className="h-1.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/30 active:bg-primary" />

                <Panel defaultSize={32} minSize={16}>
                  <div className="h-full overflow-hidden rounded-xl border bg-card">
                    <OutputPanel />
                  </div>
                </Panel>
              </Group>
            </Panel>
          </Group>
        </div>

        <div className="flex min-h-0 shrink-0">
          <div
            className={cn(
              "overflow-hidden transition-[width,opacity] duration-300 ease-out",
              desktopRightPanel ? "mr-2 w-90 opacity-100" : "w-0 opacity-0"
            )}
          >
            <div className="h-full w-90 overflow-hidden rounded-xl border bg-card">
              {desktopRightPanel === "video" && !isLeavingSession && (
                <VideoCallPanel
                  isLoading={isInitializingCall}
                  streamClient={streamClient}
                  call={call}
                  chatClient={chatClient}
                  channel={channel}
                />
              )}

              {desktopRightPanel === "chat" && !isLeavingSession && (
                <ChatPanel chatClient={chatClient} channel={channel} />
              )}
            </div>
          </div>

          <div className="flex h-full w-12 flex-col items-center justify-center gap-2 rounded-xl border bg-muted/50 px-1 py-2">
            <Button
              onClick={() => toggleDesktopRightPanel("video")}
              title="Video"
              variant={desktopRightPanel === "video" ? "default" : "outline"}
              className={cn(
                "h-full max-h-40 p-2",
                desktopRightPanel === "chat" && "text-muted-foreground/60 hover:text-muted-foreground"
              )}
              style={{ writingMode: "vertical-rl" }}
            >
              <IconVideoFilled className="size-4.5 rotate-90" />
              Video
            </Button>

            <Button
              onClick={() => toggleDesktopRightPanel("chat")}
              title="Chat"
              variant={desktopRightPanel === "chat" ? "default" : "outline"}
              className={cn(
                "h-full max-h-40 p-2",
                desktopRightPanel === "video" && "text-muted-foreground/60 hover:text-muted-foreground"
              )}
              style={{ writingMode: "vertical-rl" }}
            >
              <IconMessageCircleFilled className="size-4.5 rotate-90" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col md:hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className={cn("h-full overflow-hidden", activeTab !== "problem" && "hidden")}>
            <ProblemPanel
              problem={fullProblem ?? null}
              isLoading={combinedLoading}
              isError={combinedError}
              error={combinedErrorValue}
              onRetry={() => refetchProblem()}
            />
          </div>

          <div className={cn("h-full overflow-hidden", activeTab !== "code" && "hidden")}>
            <CodeEditorPanel
              codeSnippets={fullProblem?.codeSnippets}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </div>

          <div className={cn("h-full overflow-hidden", activeTab !== "output" && "hidden")}>
            <OutputPanel />
          </div>

          {activeTab === "video" && !isLeavingSession && (
            <div className="h-full overflow-hidden">
              <VideoCallPanel
                isLoading={isInitializingCall}
                streamClient={streamClient}
                call={call}
                chatClient={chatClient}
                channel={channel}
              />
            </div>
          )}

          {activeTab === "chat" && !isLeavingSession && (
            <div className="h-full overflow-hidden">
              <ChatPanel chatClient={chatClient} channel={channel} />
            </div>
          )}
        </div>

        <nav className="flex shrink-0 border-t bg-background">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 pt-4 pb-6 text-xs font-medium transition-colors",
                activeTab === id
                  ? "-mt-px border-t-4 border-primary bg-primary/10 text-primary"
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