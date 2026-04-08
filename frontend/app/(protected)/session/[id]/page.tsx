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

  const { data: currentSession, isLoading, isError, error } = useQuery<ISessionDetail>({
    queryKey: ["session", sessionId],
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
    mutationFn: async (id: string) => {
      setIsLeavingSession(true); // 🔥 important
      return endSession(id);
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: () => {
      setIsLeavingSession(false); // fallback
    },
  });


  // auto join the session if user is not host or participant
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
    if (!currentSession || isLoading) return;
    if (currentSession.status !== "active") {
      router.push("/dashboard");
    }
  }, [currentSession, isLoading, router]);

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

      {/* ── Desktop: Problem | Code/Output | Collapsible right sidebar ── */}
      {/* ── Medium screens: Problem tabs | Code + Output ── */}
      <div className="hidden md:flex lg:hidden flex-1 min-h-0 p-2 gap-2">
        <Group orientation="horizontal" className="flex-1 h-full gap-2">
          {/* Left: Problem area with tabs */}
          <Panel defaultSize={36} minSize={28}>
            <div className="flex h-full flex-col rounded-xl border bg-card overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between gap-3 border-b px-3 py-2 shrink-0">
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

              {/* Body */}
              <div className="min-h-0 flex-1 overflow-hidden">
                {mediumProblemTab === "description" ? (
                  <div className="h-full">
                    <ProblemPanel
                      problem={problem ?? null}
                      isLoading={isLoading}
                      isError={isError}
                      error={error}
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

          <Separator className="w-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

          {/* Right: code + output */}
          <Panel defaultSize={64} minSize={40}>
            <Group orientation="vertical" className="h-full gap-2">
              <Panel defaultSize={62} minSize={38}>
                <div className="h-full rounded-xl border overflow-hidden bg-card">
                  <CodeEditorPanel
                    codeStubs={problem?.codeStubs}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                  />
                </div>
              </Panel>

              <Separator className="h-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

              <Panel defaultSize={38} minSize={24}>
                <div className="h-full rounded-xl border overflow-hidden bg-card">
                  <OutputPanel />
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>

        {/* Chat sheet */}
        <Sheet open={chatSheetOpen} onOpenChange={setChatSheetOpen}>
          <SheetContent side="left" className="w-95 sm:w-105 p-0">
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>Session Chat</SheetTitle>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-hidden">
                {!isLeavingSession && (
                  <ChatPanel
                    chatClient={chatClient}
                    channel={channel}
                  />
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:flex flex-1 min-h-0 p-2 gap-2">
        {/* Left + Center workspace */}
        <div className="flex-1 min-w-0">
          <Group orientation="horizontal" className="h-full gap-2">
            <Panel defaultSize={34} minSize={24}>
              <div className="h-full rounded-xl border overflow-hidden bg-card">
                <ProblemPanel
                  problem={problem ?? null}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                />
              </div>
            </Panel>

            <Separator className="w-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

            <Panel defaultSize={66} minSize={38}>
              <Group orientation="vertical" className="h-full gap-2">
                <Panel defaultSize={68} minSize={42}>
                  <div className="h-full rounded-xl border overflow-hidden bg-card">
                    <CodeEditorPanel
                      codeStubs={problem?.codeStubs}
                      onRun={handleRun}
                      onSubmit={handleSubmit}
                    />
                  </div>
                </Panel>

                <Separator className="h-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

                <Panel defaultSize={32} minSize={16}>
                  <div className="h-full rounded-xl border overflow-hidden bg-card">
                    <OutputPanel />
                  </div>
                </Panel>
              </Group>
            </Panel>
          </Group>
        </div>

        {/* Right collapsible sidebar */}
        <div className="flex min-h-0 shrink-0">
          {/* Expanded panel */}
          <div
            className={cn(
              "overflow-hidden transition-[width,opacity] duration-300 ease-out",
              desktopRightPanel ? "w-90 opacity-100 mr-2" : "w-0 opacity-0"
            )}
          >
            <div className="h-full w-90 rounded-xl border bg-card overflow-hidden">
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
                <ChatPanel
                  chatClient={chatClient}
                  channel={channel}
                />
              )}
            </div>
          </div>

          {/* Slim icon rail */}
          <div
            className="flex h-full w-12 flex-col items-center justify-center gap-2 rounded-xl border bg-muted/50 px-1 py-2"
          >
            <Button
              onClick={() => toggleDesktopRightPanel("video")}
              title="Video"
              variant={desktopRightPanel === "video" ? "default" : "outline"}
              className={cn(
                "max-h-40 h-full  p-2",
                desktopRightPanel === "chat" && "text-muted-foreground/60 hover:text-muted-foreground"
              )}
              style={{writingMode: "vertical-rl"}}
            >
              <IconVideoFilled className="size-4.5 rotate-90" />
              Video
            </Button>

            <Button
              onClick={() => toggleDesktopRightPanel("chat")}
              variant={desktopRightPanel === "chat" ? "default" : "outline"}
              title="Chat"
              className={cn(
                "max-h-40 h-full p-2",
                desktopRightPanel === "video" && "text-muted-foreground/60 hover:text-muted-foreground"
              )}
              style={{writingMode: "vertical-rl"}}
            >
              <IconMessageCircleFilled className="size-4.5 rotate-90" />
              Chat
            </Button>
          </div>
        </div>
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

        {/* Bottom tab bar */}
        <nav className="shrink-0 flex border-t bg-background">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 pt-4 pb-6 text-xs font-medium transition-colors",
                activeTab === id
                  ? "text-primary border-t-4 bg-primary/10 border-primary -mt-px"
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