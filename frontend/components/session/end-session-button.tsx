"use client";

import { IconArrowRight, IconLoader } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EndSessionButtonProps {
    onConfim: () => void;
    isLoading: boolean;
    isHost?: boolean;
}

const EndSessionButton = ({ onConfim, isLoading, isHost = false }: EndSessionButtonProps) => {
    const endLabel = isHost ? "End Session" : "Leave Session";
    const dialogTitle = isHost ? "End this session?" : "Leave this session?";
    const dialogDescription = isHost
        ? "This will permanently end the session for all participants. This action cannot be undone."
        : "You will be removed from the session. You can rejoin if the session is still active.";
    const confirmLabel = isHost ? "End Session" : "Leave Session";
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                    {isLoading ? (
                        <IconLoader className="size-4 animate-spin" />
                    ) : (
                        <>
                            {endLabel}
                            <IconArrowRight />
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfim}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EndSessionButton