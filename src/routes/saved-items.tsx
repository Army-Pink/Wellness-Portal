import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Trash2, ArrowLeft, FolderOpen } from "lucide-react";
import { PageShell } from "@/components/portal/Shell";
import { PrivacyChoice, PrivacyWarning } from "@/components/portal/PrivacyChoice";
import { useSaving } from "@/components/portal/SavingProvider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deliverCollection } from "@/lib/export/collection";
import { itemImage, itemText, safeInternalPath } from "@/lib/storage/schema";
import { groupSavedItems } from "@/lib/saved-items-grouping";
import { usePrefs, useTx } from "@/lib/prefs";

export const Route = createFileRoute("/saved-items")({
  head: () => ({
    meta: [
      { title: "My Saved Items — Wellness Portal" },
      {
        name: "description",
        content:
          "View, reopen, download or delete the items you chose to keep in this browser on this device.",
      },
      { property: "og:title", content: "My Saved Items — Wellness Portal" },
      {
        property: "og:description",
        content: "Optional device-only saving. No account or email required.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedItems,
});

function SavedItems() {
  const { t } = usePrefs();
  const tx = useTx(); // dynamic text only: saved item names, rooms and provider errors
  const { items, ready, error, preference, remove, exportCollection } = useSaving();
  const [filter, setFilter] = useState("");
  const [opened, setOpened] = useState<string | null>(null);
  const [pending, setPending] = useState<string | "all" | null>(null);
  const [changing, setChanging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState("");
  const groups = groupSavedItems(items);
  // Filter by stable room id; fall back to all rooms if that room has no items left.
  const visible = groups.filter((g) => !filter || g.roomId === filter);
  const shown = visible.length ? visible : groups;
  const selected = items.find((x) => x.id === opened);
  const selectedPath = selected ? safeInternalPath(selected.source) : undefined;
  const loadFailed = ready && !!error && !items.length && !exportError;
  const deleteConfirmed = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await remove(pending === "all" ? null : pending, true);
      setPending(null);
      setOpened(null);
    } catch {
      /* Provider displays a content-free error. */
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageShell title="My Saved Items" back={{ to: "/", label: "Home" }}>
      <PrivacyWarning />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {t(preference === "device" ? "saved.statusDevice" : "saved.statusNone")}
        </p>
        <Button
          variant="outline"
          className="h-auto min-h-11 whitespace-normal rounded-full"
          onClick={() => setChanging(!changing)}
        >
          {t(preference === "device" ? "saved.turnSavingOff" : "saved.saveOnDevice")}
        </Button>
      </div>
      {changing && (
        <div className="my-6 max-w-2xl">
          <PrivacyChoice onChoice={() => setChanging(false)} />
        </div>
      )}
      {(error || exportError) && (
        <p role="alert" className="my-4 text-sm text-destructive">
          {tx(error || exportError)}
        </p>
      )}
      {!ready ? (
        <p role="status" className="py-8">
          {t("saved.loading")}
        </p>
      ) : selected ? (
        <article className="mt-8 space-y-5">
          <Button variant="ghost" className="rounded-full" onClick={() => setOpened(null)}>
            <ArrowLeft />
            {t("nav.savedItems")}
          </Button>
          <h2 className="break-words text-xl font-bold">{tx(selected.activity)}</h2>
          <p className="text-sm text-muted-foreground">
            {tx(selected.room)} · {new Date(selected.createdAt).toLocaleDateString()}
          </p>
          {itemImage(selected) && (
            <img
              src={itemImage(selected)}
              alt="Saved artwork"
              className="w-full max-w-2xl rounded-lg border bg-card"
            />
          )}
          {itemText(selected) && (
            <p className="max-w-2xl whitespace-pre-wrap break-words text-base">
              {itemText(selected)}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {selectedPath ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link to={selectedPath}>{t("saved.returnToActivity")}</Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">{t("saved.cannotReopen")}</p>
            )}
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setPending(selected.id)}
            >
              <Trash2 />
              {t("saved.deleteItem")}
            </Button>
          </div>
        </article>
      ) : (
        <>
          <div className="my-8 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              {t("saved.room")}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="min-h-11 max-w-full rounded-lg border bg-card px-3 text-foreground"
              >
                <option value="">{t("saved.allRooms")}</option>
                {groups.map((g) => (
                  <option key={g.roomId} value={g.roomId}>
                    {tx(g.room)}
                  </option>
                ))}
              </select>
            </label>
            <Button
              disabled={!items.length}
              variant="secondary"
              className="h-auto min-h-11 whitespace-normal rounded-full"
              onClick={() => {
                setExportError("");
                // Built and downloaded locally; nothing is uploaded (ADR 0001, D3).
                void exportCollection()
                  .then(deliverCollection)
                  .catch(() =>
                    setExportError("Could not export your collection. Please try again."),
                  );
              }}
            >
              <Download />
              {t("saved.download")}
            </Button>
            <Button
              disabled={!items.length}
              variant="outline"
              className="h-auto min-h-11 whitespace-normal rounded-full"
              onClick={() => setPending("all")}
            >
              <Trash2 />
              {t("saved.deleteAll")}
            </Button>
          </div>
          {!items.length && !loadFailed && (
            <p className="py-8 text-muted-foreground">{t("saved.empty")}</p>
          )}
          {loadFailed && <p className="py-8 text-muted-foreground">{t("saved.loadFailed")}</p>}
          {filter && !visible.length && groups.length > 0 && (
            <p className="py-4 text-muted-foreground">{t("saved.roomEmpty")}</p>
          )}
          <div className="space-y-10">
            {shown.map((group) => (
              <section key={group.roomId} aria-labelledby={`room-${group.roomId}`}>
                <h2 id={`room-${group.roomId}`} className="break-words text-xl font-bold">
                  {tx(group.room)} ({group.count})
                </h2>
                <div className="mt-4 space-y-6">
                  {group.activities.map((activity) => (
                    <div key={activity.activityId}>
                      <h3 className="break-words text-lg font-semibold">{tx(activity.activity)}</h3>
                      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                        {activity.items.map((item) => (
                          <li key={item.id} className="min-w-0 rounded-lg border bg-card p-5">
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                className="rounded-full"
                                aria-label={`${t("saved.openItem")}: ${item.activity}`}
                                onClick={() => setOpened(item.id)}
                              >
                                <FolderOpen />
                                {t("saved.openItem")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`${t("saved.deleteItem")}: ${item.activity}`}
                                title={t("saved.deleteItem")}
                                className="rounded-full"
                                onClick={() => setPending(item.id)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-lg sm:max-w-lg">
          <AlertDialogTitle>
            {t(pending === "all" ? "privacy.deleteAllTitle" : "saved.deleteOneTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("privacy.cannotUndo")}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy} className="rounded-full">
              {t("action.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className="rounded-full"
              onClick={(e) => {
                e.preventDefault();
                void deleteConfirmed();
              }}
            >
              {t(busy ? "action.deleting" : "action.deletePermanently")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
