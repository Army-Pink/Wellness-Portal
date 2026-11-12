import { useState } from "react";
import { HardDrive, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { usePrefs, useTx } from "@/lib/prefs";
import { PRIVACY_WARNING } from "@/lib/privacy-copy";
import { useSaving } from "./SavingProvider";

export function PrivacyWarning() {
  // Safety guidance stays English until approved translation is supplied.
  return <p className="text-sm leading-relaxed text-muted-foreground">{PRIVACY_WARNING}</p>;
}

export function PrivacyChoice({ onChoice }: { onChoice?: () => void }) {
  const { t } = usePrefs();
  const tx = useTx(); // provider error text only (dynamic, not a catalog message yet)
  const { choose, remove, error, items, preference } = useSaving();
  const [busy, setBusy] = useState(false);
  // D5: turning saving off with items present asks whether to keep or delete them.
  const [askExisting, setAskExisting] = useState<"ask" | "confirm-delete" | null>(null);
  const select = async (value: "device" | "none") => {
    if (value === "none" && preference === "device" && items.length > 0) {
      setAskExisting("ask");
      return;
    }
    setBusy(true);
    if (await choose(value)) onChoice?.();
    setBusy(false);
  };
  const continueWithoutSaving = async (deleteExisting: boolean) => {
    setBusy(true);
    try {
      if (deleteExisting) await remove(null, true);
      if (await choose("none")) {
        setAskExisting(null);
        onChoice?.();
      }
    } catch {
      // Provider shows a content-free error; keep the dialog open to retry.
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="w-full space-y-5">
      <h2 className="text-2xl font-bold sm:text-3xl">{t("privacy.title")}</h2>
      <p className="text-base text-muted-foreground">{t("privacy.intro")}</p>
      <div className="grid gap-4">
        <div>
          <Button
            disabled={busy}
            onClick={() => select("device")}
            className="min-h-12 h-auto w-full whitespace-normal rounded-full px-6 py-3"
          >
            <HardDrive />
            {t("privacy.saveDevice")}
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">{t("privacy.saveDeviceHelp")}</p>
        </div>
        <div>
          <Button
            disabled={busy}
            variant="secondary"
            onClick={() => select("none")}
            className="min-h-12 h-auto w-full whitespace-normal rounded-full px-6 py-3"
          >
            <ArrowRight />
            {t("privacy.continueWithout")}
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">{t("privacy.continueWithoutHelp")}</p>
        </div>
      </div>
      <PrivacyWarning />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {tx(error)}
        </p>
      )}
      <AlertDialog
        open={askExisting !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setAskExisting(null);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-lg sm:max-w-lg">
          {/* Copy pending founder approval (ADR 0001, D5). */}
          {askExisting === "confirm-delete" ? (
            <>
              <AlertDialogTitle>{t("privacy.deleteAllTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("privacy.cannotUndo")}</AlertDialogDescription>
              <AlertDialogFooter>
                <Button
                  variant="outline"
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => setAskExisting("ask")}
                >
                  {t("action.cancel")}
                </Button>
                <Button
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => void continueWithoutSaving(true)}
                >
                  {busy ? t("action.deleting") : t("action.deletePermanently")}
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogTitle>{t("privacy.keepTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("privacy.keepBody")}</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy} className="rounded-full">
                  {t("action.cancel")}
                </AlertDialogCancel>
                <Button
                  variant="outline"
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => setAskExisting("confirm-delete")}
                >
                  {t("privacy.deleteNow")}
                </Button>
                <Button
                  disabled={busy}
                  className="rounded-full"
                  onClick={() => void continueWithoutSaving(false)}
                >
                  {t("privacy.keepItems")}
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
