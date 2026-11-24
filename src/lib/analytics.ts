/**
 * Aggregate, privacy-preserving analytics (founder's specification, confirmed 24 Nov 2026).
 *
 * - Vercel Web Analytics page views plus the custom events below. No Google Analytics,
 *   no cookies, no persistent identifiers, no cross-site tracking, no session recording.
 * - Events carry only short category values from the allowlist (e.g. a room slug), never
 *   names, contact details, IDs, journal text, artwork, free text, searches or location.
 * - Requests go only to the Portal's own domain (Vercel's first-party intake path).
 * - Only active on the deployed site; local development, previews on localhost and tests
 *   send nothing.
 *
 * Adding an event or a property is a privacy change: update ALLOWED_PROPS, the unit tests
 * and the privacy page in the same pull request.
 */
import { track as vercelTrack, type BeforeSendEvent } from "@vercel/analytics";

export type EngagementRange = "<30s" | "30s-2m" | "2-5m" | "5-10m" | "10m+";

/** Every event the Portal may send, with the only property keys each may carry. */
export const ALLOWED_PROPS = {
  landing_opened: [],
  quick_exit_selected: [],
  art_room_opened: [],
  art_stage_reached: [],
  art_exercise_completed: [],
  recovery_room_opened: ["room"],
  recovery_exercise_started: ["room"],
  calm_media_opened: ["media"],
  calm_media_play: [],
  calm_media_pause: [],
  calm_captions_toggled: [],
  library_opened: [],
  library_category_opened: ["category"],
  library_resource_opened: ["category"],
  opportunity_category_opened: [],
  opportunity_viewed: [],
  external_link_selected: [],
  save_action: ["room", "kind"],
  save_deleted: ["scope"],
  language_english_selected: [],
  language_spanish_selected: [],
  accessibility_control_used: ["control"],
  error_occurred: ["code"],
} as const satisfies Record<string, readonly string[]>;

export type PortalEvent = keyof typeof ALLOWED_PROPS;

/** Values must be short lowercase categories, so free text can never slip through. */
const SAFE_VALUE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_VALUE_LENGTH = 40;

/**
 * Returns the properties that may be sent for this event, or null if the event must be
 * dropped (unknown event, unknown key, or a value that isn't a short category).
 */
export function sanitizeEvent(
  event: string,
  props: Record<string, string> = {},
): Record<string, string> | null {
  if (!Object.hasOwn(ALLOWED_PROPS, event)) return null;
  const allowed: readonly string[] = ALLOWED_PROPS[event as PortalEvent];
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!allowed.includes(key)) return null;
    if (typeof value !== "string" || value.length > MAX_VALUE_LENGTH || !SAFE_VALUE.test(value))
      return null;
    clean[key] = value;
  }
  return clean;
}

/** Strip query strings and fragments so nothing typed or linked can ride along in a URL. */
export function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    return { ...event, url: `${url.origin}${url.pathname}` };
  } catch {
    return null;
  }
}

/** True only on the deployed site, never in development, tests or local previews. */
export function analyticsEnabled(): boolean {
  if (!import.meta.env.PROD || typeof window === "undefined") return false;
  return !["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
}

export function track<E extends PortalEvent>(
  event: E,
  props?: Partial<Record<(typeof ALLOWED_PROPS)[E][number], string>>,
): void {
  const clean = sanitizeEvent(event, props as Record<string, string> | undefined);
  if (!clean || !analyticsEnabled()) return;
  try {
    vercelTrack(event, clean);
  } catch {
    // Analytics must never break the Portal or report anything about the failure.
  }
}
