import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UnsavedChangesGuardProps = {
  when: boolean;
  title?: string;
  description?: string;
};

export default function UnsavedChangesGuard({
  when,
  title = "Unsaved changes",
  description = "You have unsaved changes. Leaving will discard them.",
}: UnsavedChangesGuardProps) {
  const blocker = useBlocker(when);
  const isBlocked = blocker.state === "blocked";

  useEffect(() => {
    if (!when) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);

  return (
    <AlertDialog
      open={isBlocked}
      onOpenChange={(open) => {
        if (!open && isBlocked) {
          blocker.reset();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset()}>Stay</AlertDialogCancel>
          <AlertDialogAction onClick={() => blocker.proceed()}>Leave</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

