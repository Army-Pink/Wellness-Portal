import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { PrivacyWarning } from "@/components/portal/PrivacyChoice";
import { Link } from "@tanstack/react-router";
import { useTx } from "@/lib/prefs";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Your Privacy — Wellness Portal" },
      {
        name: "description",
        content:
          "How the Wellness Portal protects survivor privacy: no sign-up, no profiles, no trackers.",
      },
      { property: "og:title", content: "Your Privacy — Wellness Portal" },
      { property: "og:description", content: "No sign-up, no profiles, no trackers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const promises = [
  "No sign-up or login is ever required",
  "No survivor profiles",
  "No advertising trackers or retargeting",
  "No session recording or invasive heatmaps",
  "No precise location tracking",
  "No identifying information collected for analytics",
  "No cookies or persistent identifiers",
];

function Privacy() {
  const tx = useTx();
  return (
    <PageShell
      title="Your privacy"
      intro="This Portal is designed so you never have to tell us who you are."
      tags={<StatusTag status="confirmed" />}
      back={{ to: "/", label: "Home" }}
    >
      <div className="mb-6 space-y-3">
        <PrivacyWarning />
        <Link to="/saved-items" className="text-primary underline">
          {tx("My Saved Items")}
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {promises.map((p) => (
          <li key={p} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
            {tx(p)}
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-3xl border bg-card p-6">
        <h2 className="text-lg font-bold">About Quick Exit</h2>
        <p className="mt-2">
          Quick Exit (or the Esc key) takes you to a neutral website right away. It does not erase
          your browser history and cannot guarantee that no one is monitoring your device. Consider
          using a private browsing window.
        </p>
        <p className="mt-2">
          Esc works everywhere in the Portal, even while you are typing, drawing or have a window
          open. Anything you have not saved is left behind when you exit.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border p-6">
        <h2 className="text-lg font-bold">Saving on this device</h2>
        <p className="mt-2 text-muted-foreground">
          Your activity is not automatically saved. You can choose Save on This Device to keep
          supported items in this browser on this device, or Continue Without Saving to use the
          Portal without intentionally saving items.
        </p>
        <p className="mt-2 text-muted-foreground">
          Turn Saving Off stops future saves. Items you already saved stay on this device until you
          delete them. Download My Saved Items gives you a ZIP of your saved artwork images,
          readable text files and a simple index. It is built in your browser and not uploaded.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border p-6">
        <h2 className="text-lg font-bold">Usage measurement</h2>
        <p className="mt-2 text-muted-foreground">
          To improve the Portal, we count aggregate, anonymous usage with Vercel Web Analytics:
          visits, which rooms and resources are opened, language choice, how often items are saved
          or deleted, navigation, Quick Exit use and technical errors. These are totals, not a
          record of what any one person did.
        </p>
        <p className="mt-2 text-muted-foreground">
          We never collect your name, contact details, client, ride or case information, journal
          entries, artwork, anything you type, searches or your precise location. There are no
          cookies, persistent identifiers, advertising trackers, cross-site tracking, session
          recordings or heatmaps. The measurement records the page address (without anything after a
          "?" or "#"), the type of device, browser and operating system, and an approximate region.
        </p>
      </section>
    </PageShell>
  );
}
