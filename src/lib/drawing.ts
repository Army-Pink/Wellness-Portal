/**
 * Drawing model for the Art Room canvas (AP-18, ticket AR-1).
 *
 * - The canvas has a fixed internal size, so a picture looks the same whatever the
 *   screen size, and turning or resizing the window never clears or distorts it.
 *   CSS scales the canvas; pointer positions are mapped into canvas units.
 * - Strokes are stored as points, not as full-picture copies. Only the last
 *   `MAX_UNDO` strokes can be undone; older ones are merged into one hidden layer,
 *   so memory stays small however long someone draws.
 * - Nothing here touches the network or storage. The picture only leaves this model
 *   when the page calls `canvas.toDataURL()` for the visitor's own Save click.
 */

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 900;
/** Brush sizes are chosen in screen-sized units; the canvas is about twice as wide. */
export const BRUSH_SCALE = 2;
export const MAX_UNDO = 30;
/** Safety cap so a runaway pointer cannot grow one stroke without limit. */
export const MAX_POINTS_PER_STROKE = 20_000;

export interface Point {
  x: number;
  y: number;
}
export interface BrushStyle {
  /** A resolved CSS colour such as "#e63e6d" (not a variable name). */
  color: string;
  size: number;
  eraser: boolean;
}
export interface Stroke extends BrushStyle {
  points: Point[];
}

/** Map a pointer position on the displayed canvas into canvas units, kept inside the canvas. */
export function toCanvasPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
): Point {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  const x = ((clientX - rect.left) / rect.width) * width;
  const y = ((clientY - rect.top) / rect.height) * height;
  return { x: Math.min(width, Math.max(0, x)), y: Math.min(height, Math.max(0, y)) };
}

function applyStyle(ctx: CanvasRenderingContext2D, s: BrushStyle) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = s.size * BRUSH_SCALE;
  ctx.globalCompositeOperation = s.eraser ? "destination-out" : "source-over";
  ctx.strokeStyle = s.color;
}

/** Draw a whole stroke. A single point is drawn as a dot. */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const [first, ...rest] = stroke.points;
  if (!first) return;
  applyStyle(ctx, stroke);
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  if (rest.length === 0) ctx.lineTo(first.x + 0.1, first.y + 0.1);
  for (const p of rest) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

export class Drawing {
  private strokes: Stroke[] = [];
  private current: Stroke | null = null;
  private base: HTMLCanvasElement | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly makeCanvas: () => HTMLCanvasElement = () => document.createElement("canvas"),
  ) {}

  get drawing() {
    return this.current !== null;
  }
  get undoable() {
    return this.strokes.length;
  }

  private ctx() {
    return this.canvas.getContext("2d");
  }

  /** Start a stroke at a point (a tap with no move leaves a dot). */
  begin(point: Point, style: BrushStyle) {
    const g = this.ctx();
    if (!g) return;
    this.current = { ...style, points: [point] };
    drawStroke(g, this.current);
  }

  extend(point: Point) {
    const g = this.ctx();
    const s = this.current;
    if (!g || !s || s.points.length >= MAX_POINTS_PER_STROKE) return;
    const last = s.points[s.points.length - 1];
    s.points.push(point);
    if (!last) return;
    applyStyle(g, s);
    g.beginPath();
    g.moveTo(last.x, last.y);
    g.lineTo(point.x, point.y);
    g.stroke();
  }

  /** Finish the current stroke and make it undoable. Safe to call when nothing is drawn. */
  end() {
    const s = this.current;
    this.current = null;
    if (!s) return;
    this.strokes.push(s);
    while (this.strokes.length > MAX_UNDO) {
      const old = this.strokes.shift();
      if (old) this.bake(old);
    }
  }

  undo() {
    if (this.current) this.end();
    if (this.strokes.pop()) this.redraw();
  }

  clear() {
    this.current = null;
    this.strokes = [];
    this.base = null;
    this.redraw();
  }

  /** Merge a stroke that can no longer be undone into the hidden base layer. */
  private bake(stroke: Stroke) {
    if (!this.base) {
      this.base = this.makeCanvas();
      this.base.width = this.canvas.width;
      this.base.height = this.canvas.height;
    }
    const g = this.base.getContext("2d");
    if (g) drawStroke(g, stroke);
  }

  private redraw() {
    const g = this.ctx();
    if (!g) return;
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.base) g.drawImage(this.base, 0, 0);
    for (const s of this.strokes) drawStroke(g, s);
  }
}
