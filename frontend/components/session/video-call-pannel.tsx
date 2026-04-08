import { IconLoader, IconPhoneOff, IconRefresh, IconUsers } from "@tabler/icons-react"
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    CallControls,
    CallingState,
    SpeakerLayout,
    StreamCall,
    StreamVideo,
    useCallStateHooks
} from "@stream-io/video-react-sdk"
import { useRouter } from "next/navigation"
// import { cn } from "@/lib/utils"

import type { StreamVideoClient, Call } from "@stream-io/video-react-sdk";
import type { StreamChat, Channel } from "stream-chat";

interface VideoCallPanelProps {
    isLoading: boolean;
    streamClient: StreamVideoClient | null;
    call: Call | null;
    chatClient: StreamChat | null;
    channel: Channel | null;
}

const VideoCallPanel = ({ isLoading, streamClient, call, chatClient, channel }: VideoCallPanelProps) => {
    if (isLoading) {
        return <LoadingState label="Initialising call…" />
    }

    if (!streamClient || !call) return <ErrorState />

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                    <VideoCallUi />
                </StreamCall>
            </StreamVideo>
        </div>
    )
}

/* ─── Loading state ─────────────────────────────────────── */
function LoadingState({ label = "Connecting…" }: { label?: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center gap-3 bg-background">
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-12 w-12 rounded-full bg-primary/20 animate-ping" />
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                    <IconLoader className="size-4 text-primary animate-spin" />
                </span>
            </div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">{label}</p>
        </div>
    )
}


function VideoCallUi() {
    const { useCallCallingState, useParticipantCount } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participantCount = useParticipantCount();
    const router = useRouter();

    if (callingState === CallingState.JOINING) {
        return <LoadingState label="Joining call…" />
    }

    return (
        <div className="h-full flex flex-col">
            {/* ── Top status bar ── */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b bg-muted/50">
                {/* Live indicator */}
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-primary">
                        Live
                    </span>
                </div>

                {/* Participant pill */}
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-muted ring-1 ring-border text-foreground">
                    <IconUsers className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium tabular-nums">
                        {participantCount}
                        <span className="text-muted-foreground ml-1">
                            {participantCount === 1 ? "participant" : "participants"}
                        </span>
                    </span>
                </div>
            </div>

            {/* ── Video area ── */}
            <div className="flex-1 min-h-0 relative bg-muted/50">
                <div className="app-video-theme str-video h-full w-full">
                    <SpeakerLayout />
                </div>
            </div>

            {/* ── Controls bar ── */}
            <div className="shrink-0 border-t bg-muted/50 px-4 py-3">
                <div className="str-video flex items-center justify-center">
                    <CallControls onLeave={() => router.push("/dashboard")} />
                </div>
            </div>
        </div>
    )
}

/* ─── Error state ───────────────────────────────────────── */
function ErrorState() {
    return (
        <div className="h-full flex items-center justify-center bg-background">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-destructive/10 ring-1 ring-destructive/20">
                        <IconPhoneOff className="text-destructive size-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-foreground text-base font-semibold">
                        Connection Failed
                    </EmptyTitle>
                    <EmptyDescription className="text-muted-foreground text-sm max-w-[24ch] text-center">
                        Unable to connect to the video call. Check your connection and try again.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2 mt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.location.reload()}
                    >
                        <IconRefresh className="size-3.5" />
                        Reconnect
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    )
}

export default VideoCallPanel