import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Brush, Eraser, Undo2, Trash2, ArrowRight } from "lucide-react";
import { PageShell, StatusTag } from "@/components/portal/Shell";
import { SaveActions } from "@/components/portal/SaveActions";
import { track } from "@/lib/analytics";
import { CANVAS_HEIGHT, CANVAS_WIDTH, Drawing, toCanvasPoint } from "@/lib/drawing";

export const Route = createFileRoute("/art-room")({
  head: () => ({
    meta: [
      { title: "The Art Room — Why I Left → Where I'm Going" },
      {
        name: "description",
        content:
          "An interactive creative journey to reflect, express yourself, and imagine what comes next.",
      },
      { property: "og:title", content: "The Art Room — Wellness Portal" },
      {
        property: "og:description",
        content: "An interactive creative journey: Why I Left → Where I'm Going.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ArtRoom,
});

const stages = [
  {
    title: "Why I Left",
    prompt: "Placeholder prompt — creative prompts to be written and approved.",
  },
  {
    title: "Where I Am",
    prompt: "Placeholder prompt — creative prompts to be written and approved.",
  },
  {
    title: "Where I'm Going",
    prompt: "Placeholder prompt — creative prompts to be written and approved.",
  },
];
const colors = ["--primary", "--coral", "--sun", "--teal", "--lavender", "--plum", "--foreground"];
const sizes = [4, 10, 22];

function Canvas({
  color,
  size,
  eraser,
  clearKey,
  undoKey,
  canvasRef,
}: {
  color: string;
  size: number;
  eraser: boolean;
  clearKey: number;
  undoKey: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const ref = canvasRef;
  const model = useRef<Drawing | null>(null);
  const activePointer = useRef<number | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    model.current = new Drawing(c);
    // Finish a stroke if the window loses focus mid-stroke, so it is never left half-open.
    const stop = () => {
      activePointer.current = null;
      model.current?.end();
    };
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("blur", stop);
      model.current = null;
    };
  }, [ref]);
  useEffect(() => {
    if (clearKey) model.current?.clear();
  }, [clearKey]);
  useEffect(() => {
    if (undoKey) model.current?.undo();
  }, [undoKey]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) =>
    toCanvasPoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // One finger or pen at a time: a resting palm or a second touch must not draw.
    if (activePointer.current !== null || !model.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activePointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const resolved =
      getComputedStyle(document.documentElement).getPropertyValue(color).trim() || "#e46";
    model.current.begin(point(e), { color: resolved, size, eraser });
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointer.current) return;
    model.current?.extend(point(e));
  };
  const finish = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointer.current) return;
    activePointer.current = null;
    model.current?.end();
  };

  return (
    <canvas
      ref={ref}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      aria-label="Drawing canvas"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
      className="aspect-[4/3] w-full touch-none cursor-crosshair rounded-2xl border-2 border-dashed bg-background"
    />
  );
}

function ArtRoom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(1);
  const [eraser, setEraser] = useState(false);
  const [clearKey, setClear] = useState(0);
  const [undoKey, setUndo] = useState(0);
  useEffect(() => {
    track("art_room_opened");
  }, []);

  return (
    <PageShell
      title="The Art Room"
      intro="Why I Left → Where I'm Going. An interactive creative journey to reflect, express yourself, and imagine what comes next."
      tags={
        <>
          <StatusTag status="confirmed" note="featured first" />
          <StatusTag status="approval" note="concept — full tool built last" />
        </>
      }
      back={{ to: "/", label: "Home" }}
    >
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Journey stages">
        {stages.map((s, i) => (
          <li key={s.title}>
            <button
              onClick={() => {
                setStage(i);
                track("art_stage_reached");
              }}
              aria-current={stage === i}
              className={`w-full rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${stage === i ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-secondary-foreground hover:brightness-95"}`}
            >
              <span className="block text-xs text-current">Stage {i + 1}</span>
              {s.title}
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border bg-card p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {stages[stage]?.prompt} Try drawing below.
          </p>
          <Canvas
            canvasRef={canvasRef}
            color={colors[color] ?? "--primary"}
            size={sizes[size] ?? 10}
            eraser={eraser}
            clearKey={clearKey}
            undoKey={undoKey}
          />
          <div className="mt-4 flex justify-between">
            <button
              disabled={stage === 0}
              onClick={() => setStage(stage - 1)}
              className="min-h-11 rounded-full border px-5 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            {stage < 2 ? (
              <button
                onClick={() => {
                  setStage(stage + 1);
                  track("art_stage_reached");
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
              >
                Next stage <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/gallery"
                onClick={() => track("art_exercise_completed")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
              >
                Finish & see the gallery
              </Link>
            )}
          </div>
        </div>
        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Colors</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {colors.map((c, i) => (
                <button
                  key={c}
                  aria-label={`Color ${i + 1}`}
                  aria-pressed={color === i && !eraser}
                  onClick={() => {
                    setColor(i);
                    setEraser(false);
                  }}
                  style={{ background: `var(${c})` }}
                  className={`h-9 w-9 rounded-full transition hover:scale-110 ${color === i && !eraser ? "ring-2 ring-ring ring-offset-2 ring-offset-card" : ""}`}
                />
              ))}
            </div>
            <p className="mb-2 text-sm font-semibold">Brush size</p>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {sizes.map((s, i) => (
                <button
                  key={s}
                  aria-label={`Size ${i + 1}`}
                  aria-pressed={size === i}
                  onClick={() => setSize(i)}
                  className={`grid min-h-11 place-items-center rounded-xl ${size === i ? "bg-secondary" : "bg-muted"}`}
                >
                  <span
                    className="rounded-full bg-foreground"
                    style={{ width: s / 1.5 + 3, height: s / 1.5 + 3 }}
                  />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                aria-label="Brush"
                aria-pressed={!eraser}
                onClick={() => setEraser(false)}
                className={`grid min-h-11 place-items-center rounded-xl ${!eraser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <Brush className="h-4 w-4" />
              </button>
              <button
                aria-label="Eraser"
                aria-pressed={eraser}
                onClick={() => setEraser(true)}
                className={`grid min-h-11 place-items-center rounded-xl ${eraser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button
                aria-label="Undo"
                onClick={() => setUndo((n) => n + 1)}
                className="grid min-h-11 place-items-center rounded-xl bg-muted"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                aria-label="Clear canvas"
                onClick={() => setClear((n) => n + 1)}
                className="grid min-h-11 place-items-center rounded-xl bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <SaveActions
            item={() => {
              const canvas = canvasRef.current;
              if (!canvas) throw new Error("Drawing unavailable");
              return {
                kind: "artwork",
                roomId: "art-room",
                activityId: `stage-${stage + 1}`,
                room: "Art Room",
                activity: stages[stage]?.title ?? "Artwork",
                source: "/art-room",
                payload: { image: canvas.toDataURL("image/png") },
              };
            }}
          />
          <p className="text-xs text-muted-foreground">
            Your drawing is not saved automatically. Saving keeps a copy in this browser only;
            artwork is never sent to the gallery.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
