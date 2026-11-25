import { describe, expect, it } from "vitest";
import { Drawing, MAX_UNDO, toCanvasPoint, type BrushStyle } from "./drawing";

/** A recording stand-in for a canvas: jsdom has no 2D drawing. */
function fakeCanvas(width = 1200, height = 900) {
  const calls: string[] = [];
  const ctx = {
    set lineCap(_: string) {},
    set lineJoin(_: string) {},
    set lineWidth(v: number) {
      calls.push(`width:${v}`);
    },
    set globalCompositeOperation(v: string) {
      calls.push(`op:${v}`);
    },
    set strokeStyle(v: string) {
      calls.push(`color:${v}`);
    },
    beginPath: () => calls.push("begin"),
    moveTo: (x: number, y: number) => calls.push(`move:${x},${y}`),
    lineTo: (x: number, y: number) => calls.push(`line:${x},${y}`),
    stroke: () => calls.push("stroke"),
    clearRect: () => calls.push("clear"),
    drawImage: () => calls.push("base"),
  };
  const canvas = { width, height, getContext: () => ctx } as unknown as HTMLCanvasElement;
  return { canvas, calls };
}

const pen: BrushStyle = { color: "#111", size: 4, eraser: false };

function stroke(d: Drawing, x: number) {
  d.begin({ x, y: 1 }, pen);
  d.extend({ x: x + 1, y: 2 });
  d.end();
}

describe("toCanvasPoint", () => {
  const rect = { left: 10, top: 20, width: 600, height: 450 };
  it("scales screen positions into canvas units, so resizing never distorts a drawing", () => {
    expect(toCanvasPoint(310, 245, rect)).toEqual({ x: 600, y: 450 });
    // The same spot on a canvas shown at half the size lands on the same canvas point.
    expect(toCanvasPoint(160, 132.5, { left: 10, top: 20, width: 300, height: 225 })).toEqual({
      x: 600,
      y: 450,
    });
  });
  it("keeps points inside the canvas", () => {
    expect(toCanvasPoint(-50, 9999, rect)).toEqual({ x: 0, y: 900 });
  });
  it("copes with a canvas that has no size yet", () => {
    expect(toCanvasPoint(5, 5, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe("Drawing", () => {
  it("draws a single tap as a dot", () => {
    const { canvas, calls } = fakeCanvas();
    const d = new Drawing(canvas);
    d.begin({ x: 5, y: 6 }, pen);
    d.end();
    expect(calls).toContain("line:5.1,6.1");
    expect(d.undoable).toBe(1);
  });

  it("undo redraws without the last stroke", () => {
    const { canvas, calls } = fakeCanvas();
    const d = new Drawing(canvas);
    stroke(d, 10);
    stroke(d, 100);
    calls.length = 0;
    d.undo();
    expect(d.undoable).toBe(1);
    expect(calls[0]).toBe("op:source-over");
    expect(calls).toContain("clear");
    expect(calls).toContain("move:10,1");
    expect(calls).not.toContain("move:100,1");
  });

  it("undo with nothing to undo does not wipe the picture", () => {
    const { canvas, calls } = fakeCanvas();
    const d = new Drawing(canvas);
    d.undo();
    expect(calls).not.toContain("clear");
  });

  it("clear empties the picture and the undo list", () => {
    const { canvas, calls } = fakeCanvas();
    const d = new Drawing(canvas);
    stroke(d, 10);
    d.clear();
    expect(calls).toContain("clear");
    expect(d.undoable).toBe(0);
  });

  it("merges strokes older than the undo limit into one layer instead of keeping copies", () => {
    const { canvas } = fakeCanvas();
    const layers: ReturnType<typeof fakeCanvas>[] = [];
    const d = new Drawing(canvas, () => {
      const f = fakeCanvas();
      layers.push(f);
      return f.canvas;
    });
    for (let i = 0; i < MAX_UNDO + 5; i++) stroke(d, i * 3);
    expect(d.undoable).toBe(MAX_UNDO);
    expect(layers).toHaveLength(1);
    // The oldest strokes were drawn onto the hidden layer, so they survive a redraw.
    expect(layers[0]!.calls).toContain("move:0,1");
  });

  it("ends a stroke safely when called twice or with nothing drawn", () => {
    const { canvas } = fakeCanvas();
    const d = new Drawing(canvas);
    d.end();
    d.begin({ x: 1, y: 1 }, pen);
    d.end();
    d.end();
    expect(d.undoable).toBe(1);
  });

  it("erases with destination-out", () => {
    const { canvas, calls } = fakeCanvas();
    const d = new Drawing(canvas);
    d.begin({ x: 1, y: 1 }, { ...pen, eraser: true });
    expect(calls).toContain("op:destination-out");
  });
});
