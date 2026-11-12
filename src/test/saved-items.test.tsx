import { render, screen, fireEvent, within, waitFor, cleanup } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { Route as SavedRoute } from "@/routes/saved-items";
import { PrefsProvider } from "@/lib/prefs";
import { SavingProvider } from "@/components/portal/SavingProvider";
import { groupSavedItems } from "@/lib/saved-items-grouping";
import { SCHEMA_VERSION, safeInternalPath, type SavedItem } from "@/lib/storage/schema";
import type { SavedItemsRepository } from "@/lib/storage/repository";

let n = 0;
const make = (roomId: string, activityId: string, over: Partial<SavedItem> = {}): SavedItem =>
  ({
    kind: "reflection",
    roomId,
    activityId,
    room: roomId === "journals" ? "Healing Journals" : "Calm Room",
    activity: activityId === "letting-go" ? "Letting go" : "Breathing",
    source: roomId === "journals" ? "/journals" : "/calm-room",
    payload: { text: `note-${n}` },
    id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date(2026, 10, 20 - n).toISOString(),
    updatedAt: new Date(2026, 10, 20 - n).toISOString(),
    ...over,
  }) as SavedItem;

function fakeRepo(items: SavedItem[], fail = false): SavedItemsRepository {
  return {
    saveItem: async () => {
      throw new Error("unused");
    },
    getSavedItems: async () => {
      if (fail) throw new Error("boom");
      return items;
    },
    getSavedItem: async () => {
      throw new Error("unused");
    },
    deleteSavedItem: async () => {},
    clearSavedItems: async () => {},
    exportSavedItems: async () => new Blob(),
    getPreference: async () => {
      if (fail) throw new Error("boom");
      return "device";
    },
    setPreference: async () => {},
  };
}

async function renderPage(repo: SavedItemsRepository) {
  const root = createRootRoute({ component: () => <Outlet /> });
  const saved = createRoute({
    getParentRoute: () => root,
    path: "/saved-items",
    component: SavedRoute.options.component!,
  });
  const dest = createRoute({
    getParentRoute: () => root,
    path: "$",
    component: () => <p>Destination page</p>,
  });
  const router = createRouter({
    routeTree: root.addChildren([saved, dest]),
    history: createMemoryHistory({ initialEntries: ["/saved-items"] }),
  });
  render(
    <PrefsProvider>
      <SavingProvider repository={repo}>
        <RouterProvider router={router} />
      </SavingProvider>
    </PrefsProvider>,
  );
  await waitFor(() => expect(screen.queryByText("Loading saved items…")).toBeNull());
  return router;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("groupSavedItems", () => {
  it("groups by room then activity, keeping newest first", () => {
    const a = make("journals", "letting-go");
    const b = make("calm-room", "breathing");
    const c = make("journals", "letting-go");
    const d = make("journals", "other", { activity: "Other" });
    const groups = groupSavedItems([a, b, c, d]);
    expect(groups.map((g) => [g.roomId, g.count])).toEqual([
      ["journals", 3],
      ["calm-room", 1],
    ]);
    expect(groups[0]!.activities.map((x) => [x.activityId, x.items.map((i) => i.id)])).toEqual([
      ["letting-go", [a.id, c.id]],
      ["other", [d.id]],
    ]);
  });
  it("returns nothing for no items", () => expect(groupSavedItems([])).toEqual([]));
});

describe("safeInternalPath", () => {
  it.each(["/journals", "/calm-room/grounding", "/"])("accepts %s", (p) =>
    expect(safeInternalPath(p)).toBe(p),
  );
  it.each(["//evil.com", "https://evil.com", "javascript:alert(1)", "/a?x=1", "journals", 5])(
    "rejects %s",
    (p) => expect(safeInternalPath(p)).toBeUndefined(),
  );
});

describe("My Saved Items page", () => {
  it("groups items under room and activity headings", async () => {
    await renderPage(
      fakeRepo([
        make("journals", "letting-go"),
        make("calm-room", "breathing"),
        make("journals", "letting-go"),
      ]),
    );
    const rooms = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(rooms).toContain("Healing Journals (2)");
    expect(rooms).toContain("Calm Room (1)");
    const section = screen
      .getByRole("heading", { name: "Healing Journals (2)" })
      .closest("section")!;
    expect(within(section).getByRole("heading", { level: 3, name: "Letting go" })).toBeTruthy();
    expect(within(section).getAllByRole("listitem")).toHaveLength(2);
  });

  it("filters to one room", async () => {
    await renderPage(fakeRepo([make("journals", "letting-go"), make("calm-room", "breathing")]));
    fireEvent.change(screen.getByLabelText("Room"), { target: { value: "calm-room" } });
    expect(screen.queryByRole("heading", { name: /Healing Journals/ })).toBeNull();
    expect(screen.getByRole("heading", { name: "Calm Room (1)" })).toBeTruthy();
  });

  it("reopens an item and links back to its validated internal path", async () => {
    const router = await renderPage(fakeRepo([make("journals", "letting-go")]));
    fireEvent.click(screen.getByRole("button", { name: "Open item: Letting go" }));
    const link = screen.getByRole("link", { name: "Return to activity" });
    expect(link.getAttribute("href")).toBe("/journals");
    fireEvent.click(link);
    await waitFor(() => expect(router.state.location.pathname).toBe("/journals"));
  });

  it("does not offer a link for a tampered source path", async () => {
    await renderPage(
      fakeRepo([make("journals", "letting-go", { source: "//evil.example/x" } as never)]),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open item: Letting go" }));
    expect(screen.queryByRole("link", { name: "Return to activity" })).toBeNull();
    expect(screen.getByText("This item can no longer be reopened as an activity.")).toBeTruthy();
  });

  it("shows an empty state and disables bulk actions", async () => {
    await renderPage(fakeRepo([]));
    expect(screen.getByText("No saved items yet.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Download collection/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Delete all/ })).toBeDisabled();
  });

  it("returns to the list, not a blank page, after the opened item is deleted", async () => {
    await renderPage(fakeRepo([make("journals", "letting-go")]));
    fireEvent.click(screen.getByRole("button", { name: "Open item: Letting go" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete permanently" }));
    await waitFor(() => expect(screen.getByText("No saved items yet.")).toBeTruthy());
  });

  it("keeps saved content out of the error and unreadable-link messages", async () => {
    await renderPage(fakeRepo([], true));
    expect(document.body.textContent).not.toMatch(/note-|boom/);
  });

  it("shows Spanish empty, error and cannot-reopen messages", async () => {
    localStorage.setItem("wp-lang", "es");
    await renderPage(fakeRepo([], true));
    expect(screen.getByText(/No se pudieron cargar los elementos guardados/)).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/almacenamiento del navegador/);
    expect(document.body.textContent).not.toMatch(/boom/);
    cleanup();
    await renderPage(fakeRepo([]));
    expect(screen.getByText("Aún no hay elementos guardados.")).toBeTruthy();
    cleanup();
    await renderPage(
      fakeRepo([make("journals", "letting-go", { source: "//evil.example/x" } as never)]),
    );
    fireEvent.click(screen.getByRole("button", { name: /Abrir elemento/ }));
    expect(screen.getByText("Este elemento ya no se puede reabrir como actividad.")).toBeTruthy();
  });

  it("shows a content-free error, not the empty state, when loading fails", async () => {
    await renderPage(fakeRepo([], true));
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    expect(screen.queryByText("No saved items yet.")).toBeNull();
    expect(
      screen.getByText(/could not be loaded from this browser\. Nothing has been deleted/),
    ).toBeTruthy();
  });
});
