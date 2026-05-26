
import { Shape, StrokeStyle } from "@/types/DrawingShapesTypes";
import { drawDiamond } from "@/drawingservice/util/Diamand";
import { drawArrow } from "@/drawingservice/util/Drawarrow";
import { applyStrokeStyle } from "@/drawingservice/util/StrokeStyle";
import { distance } from "../util/PixelHitPoint";

// ─── Resize handle positions ────────
type HandlePosition =
  | "nw" | "n" | "ne"
  | "w" | "e"
  | "sw" | "s" | "se";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HANDLE_SIZE = 8;
const HANDLE_HIT = 10;
const SELECTION_PAD = 6; // padding added by drawSelectionWithHandles

export class SketchEngine {

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private socket?: WebSocket | null;
  private roomId?: string;
  private textarea?: HTMLTextAreaElement | null;

  private shapes: Shape[] = [];
  private path: { x: number; y: number }[] = [];

  private tool = "pencil";
  private color = "#FFFFFF";
  private strokeWidth = 2;
  private strokeStyle?: StrokeStyle;
  private eraserSize = 10;

  private clicked = false;
  private startX = 0;
  private startY = 0;

  private isTyping = false;
  private textX = 0;
  private textY = 0;

  // ── selection / drag / resize ──
  private selectedShapeId: string | null = null;

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  private isResizing = false;
  private resizeHandle: HandlePosition | null = null;
  private resizeStartBox: BoundingBox | null = null;
  private resizeOriginX = 0;
  private resizeOriginY = 0;

  private moved = false;
  private dragThreshold = 3;

  private hoverX = 0;
  private hoverY = 0;

  private cleanupSocket?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    options?: {
      socket?: WebSocket | null;
      roomId?: string;
      textarea?: HTMLTextAreaElement | null;
      initialShapes?: Shape[];
    }
  ) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    this.ctx = ctx;

    this.socket = options?.socket;
    this.roomId = options?.roomId;
    this.textarea = options?.textarea;

    if (options?.initialShapes) {
      this.shapes = options.initialShapes;
    }

    this.setupCanvas();
    this.attachEvents();
    this.setupTextarea();
    this.setupSocket();
    this.redraw();
  }

     
  //CLEANUP ───────────
  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  // ────────────────────────────
  // SETTERS
  // ────────────────────────────

  public setTool(tool: string) {
    if (tool !== "select") {
      this.selectedShapeId = null;
      this.isResizing = false;
      this.isDragging = false;
    }
    this.tool = tool;
    this.redraw();
  }

  public setColor(color: string) { this.color = color; }
  public setStroke(width: number) { this.strokeWidth = width; }
  public setStrokeStyle(style: StrokeStyle) { this.strokeStyle = style; }

  public setSocket(socket: WebSocket | null) {
    this.cleanupSocket?.();
    this.socket = socket;
    this.setupSocket();
  }

  // ────────────────────────────
  // SOCKET
  // ────────────────────────────

  private setupSocket() {
    if (!this.socket) return;

    const handler = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.type === "realtime_drawing" && data.roomId === this.roomId) {
        const shape = JSON.parse(data.coordinate)?.shape;
        if (!shape) return;
        const idx = this.shapes.findIndex(s => s.id === shape.id);
        if (idx !== -1) {
          this.shapes[idx] = shape;
        } else {
          this.shapes.push(shape);
        }
        this.redraw();
      }

      if (data.type === "shape_update" && data.roomId === this.roomId) {
        const updated = JSON.parse(data.coordinate)?.shape;
        if (!updated) return;
        this.shapes = this.shapes.map(s => s.id === updated.id ? updated : s);
        this.redraw();
      }

      if (data.type === "erase" && data.roomId === this.roomId) {
        this.shapes = this.shapes.filter(s => s.id !== data.shapeId);
        this.redraw();
      }

      if (data.type === "reset_canvas" && data.roomId === this.roomId) {
        this.shapes = [];
        this.redraw();
      }
    };

    this.socket.addEventListener("message", handler);
    this.cleanupSocket = () => this.socket?.removeEventListener("message", handler);
  }

  private send(shape: Shape) {
    if (!this.socket) return;
    this.socket.send(JSON.stringify({
      type: "realtime_drawing",
      roomId: this.roomId,
      coordinate: JSON.stringify({ shape }),
    }));
  }

  private sendUpdate(shape: Shape) {
    if (!this.socket) return;
    this.socket.send(JSON.stringify({
      type: "shape_update",
      roomId: this.roomId,
      coordinate: JSON.stringify({ shape }),
    }));
  }

  private sendErase(shapeId: string) {
    if (!this.socket) return;
    this.socket.send(JSON.stringify({ type: "erase", roomId: this.roomId, shapeId }));
  }

  public resetCanvas() {
    this.shapes = [];
    this.redraw();
    if (!this.socket) return;
    this.socket.send(JSON.stringify({ type: "reset_canvas", roomId: this.roomId }));
  }

  // ────────────────────────────
  // TEXT / TEXTAREA
  // ────────────────────────────

  private setupTextarea() {
    if (!this.textarea) return;

    this.textarea.onkeydown = (e) => {
      if (e.key === "Escape") { this.hideTextarea(); return; }
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.commitText(); }
    };

    this.textarea.onblur = () => this.commitText();
  }

  private commitText() {
    if (!this.textarea) return;
    const value = this.textarea.value.trim();

    if (!value) { this.hideTextarea(); return; }

    if (this.selectedShapeId) {
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (shape && shape.type === "text") {
        shape.text = value;
        this.sendUpdate(shape);
        this.redraw();
        this.hideTextarea();
        return;
      }
    }

    const shape: Shape = {
      id: crypto.randomUUID(),
      type: "text",
      x: this.textX,
      y: this.textY,
      text: value,
      fontSize: 16,
      width: 120,
      height: 40,
      color: this.color,
    };

    this.shapes.push(shape);
    this.redraw();
    this.send(shape);
    this.hideTextarea();
  }

  private hideTextarea() {
    if (!this.textarea) return;
    this.textarea.style.display = "none";
    this.textarea.value = "";
    this.isTyping = false;
    this.selectedShapeId = null;
  }

  // ────────────────────────────
  // BOUNDING BOX
  // Returns the RAW bounding box of the shape (no selection padding).
  // Selection padding is only applied in drawSelectionWithHandles + getResizeBox.
  // ────────────────────────────

  private getBoundingBox(shape: Shape): BoundingBox | null {
    switch (shape.type) {
      case "rectangle":
      case "diamond":
      case "text":
        return {
          x: shape.x,
          y: shape.y,
          width: shape.width || 120,
          height: shape.height || 40,
        };

      case "circle":
        return {
          x: shape.centerX - shape.radius,
          y: shape.centerY - shape.radius,
          width: shape.radius * 2,
          height: shape.radius * 2,
        };

      case "ellipse":
        return {
          x: shape.centerX - shape.radiusX,
          y: shape.centerY - shape.radiusY,
          width: shape.radiusX * 2,
          height: shape.radiusY * 2,
        };

      case "line":
      case "arrow": {
        const minX = Math.min(shape.x1, shape.x2);
        const minY = Math.min(shape.y1, shape.y2);
        return {
          x: minX,
          y: minY,
          width: Math.abs(shape.x2 - shape.x1),
          height: Math.abs(shape.y2 - shape.y1),
        };
      }

      case "pencil": {
        if (!shape.points.length) return null;
        const xs = shape.points.map(p => p.x);
        const ys = shape.points.map(p => p.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        // Raw box — no PAD here. PAD is added only in getResizeBox.
        return {
          x: minX,
          y: minY,
          width: Math.max(maxX - minX, 1),
          height: Math.max(maxY - minY, 1),
        };
      }

      default:
        return null;
    }
  }

  /**
   * The box used for drawing the selection rect and placing handles.
   * This is the raw box expanded by SELECTION_PAD on every side.
   * This is also what we snapshot as resizeStartBox.
   */
  private getResizeBox(shape: Shape): BoundingBox | null {
    const box = this.getBoundingBox(shape);
    if (!box) return null;
    return {
      x: box.x - SELECTION_PAD,
      y: box.y - SELECTION_PAD,
      width: box.width + SELECTION_PAD * 2,
      height: box.height + SELECTION_PAD * 2,
    };
  }

  // ────────────────────────────
  // RESIZE HANDLE POSITIONS
  // ────────────────────────────

  private getHandles(box: BoundingBox): Record<HandlePosition, { x: number; y: number }> {
    const { x, y, width: w, height: h } = box;
    return {
      nw: { x,          y          },
      n:  { x: x + w/2, y          },
      ne: { x: x + w,   y          },
      w:  { x,          y: y + h/2 },
      e:  { x: x + w,   y: y + h/2 },
      sw: { x,          y: y + h   },
      s:  { x: x + w/2, y: y + h   },
      se: { x: x + w,   y: y + h   },
    };
  }

  private hitHandle(pos: { x: number; y: number }, box: BoundingBox): HandlePosition | null {
    const handles = this.getHandles(box);
    for (const [name, pt] of Object.entries(handles) as [HandlePosition, { x: number; y: number }][]) {
      if (Math.abs(pos.x - pt.x) <= HANDLE_HIT && Math.abs(pos.y - pt.y) <= HANDLE_HIT) {
        return name;
      }
    }
    return null;
  }

  private handleCursor(h: HandlePosition): string {
    const map: Record<HandlePosition, string> = {
      nw: "nw-resize", n: "n-resize",  ne: "ne-resize",
      w:  "w-resize",                   e: "e-resize",
      sw: "sw-resize", s: "s-resize",  se: "se-resize",
    };
    return map[h];
  }

  // ────────────────────────────
  // APPLY RESIZE
  //
  // KEY INSIGHT for pencil:
  //   - resizeStartBox is the PADDED box (getResizeBox snapshot)
  //   - The actual pencil points live in the INNER (raw) box
  //   - So we must strip SELECTION_PAD to get the raw origin/size,
  //     and also strip it from the new target box before scaling points.
  // ────────────────────────────

  private applyResize(
    shape: Shape,
    handle: HandlePosition,
    startBox: BoundingBox,   // this is the padded resize box
    dx: number,
    dy: number
  ) {
    let { x, y, width, height } = startBox;

    if (handle.includes("e")) width  += dx;
    if (handle.includes("s")) height += dy;
    if (handle.includes("w")) { x += dx; width  -= dx; }
    if (handle.includes("n")) { y += dy; height -= dy; }

    width  = Math.max(width,  10);
    height = Math.max(height, 10);

    switch (shape.type) {
      case "rectangle":
      case "diamond":
      case "text":
        // startBox is padded, so subtract PAD to get true shape coords
        shape.x      = x + SELECTION_PAD;
        shape.y      = y + SELECTION_PAD;
        shape.width  = width  - SELECTION_PAD * 2;
        shape.height = height - SELECTION_PAD * 2;
        break;

      case "circle": {
        const innerX = x + SELECTION_PAD;
        const innerY = y + SELECTION_PAD;
        const innerW = width  - SELECTION_PAD * 2;
        const innerH = height - SELECTION_PAD * 2;
        shape.centerX = innerX + innerW / 2;
        shape.centerY = innerY + innerH / 2;
        shape.radius  = Math.min(innerW, innerH) / 2;
        break;
      }

      case "ellipse": {
        const innerX = x + SELECTION_PAD;
        const innerY = y + SELECTION_PAD;
        const innerW = width  - SELECTION_PAD * 2;
        const innerH = height - SELECTION_PAD * 2;
        shape.centerX  = innerX + innerW / 2;
        shape.centerY  = innerY + innerH / 2;
        shape.radiusX  = innerW / 2;
        shape.radiusY  = innerH / 2;
        break;
      }

      case "line":
      case "arrow": {
        const innerX = x + SELECTION_PAD;
        const innerY = y + SELECTION_PAD;
        const innerW = width  - SELECTION_PAD * 2;
        const innerH = height - SELECTION_PAD * 2;
        shape.x1 = innerX;
        shape.y1 = innerY;
        shape.x2 = innerX + innerW;
        shape.y2 = innerY + innerH;
        break;
      }

      case "pencil": {
        // startBox is the padded box — strip PAD to get the original raw box
        const origRawX = startBox.x + SELECTION_PAD;
        const origRawY = startBox.y + SELECTION_PAD;
        const origRawW = startBox.width  - SELECTION_PAD * 2;
        const origRawH = startBox.height - SELECTION_PAD * 2;

        // New target raw box (strip PAD from new padded box)
        const newRawX = x + SELECTION_PAD;
        const newRawY = y + SELECTION_PAD;
        const newRawW = Math.max(width  - SELECTION_PAD * 2, 1);
        const newRawH = Math.max(height - SELECTION_PAD * 2, 1);

        shape.points = shape.points.map(p => ({
          x: origRawW > 1
            ? newRawX + ((p.x - origRawX) / origRawW) * newRawW
            : p.x + (newRawX - origRawX),
          y: origRawH > 1
            ? newRawY + ((p.y - origRawY) / origRawH) * newRawH
            : p.y + (newRawY - origRawY),
        }));
        break;
      }
    }
  }

  // ────────────────────────────
  // REDRAW
  // ────────────────────────────

  private redraw() {
    const W = this.canvas.clientWidth;
    const H = this.canvas.clientHeight;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, W, H);

    for (const s of this.shapes) {
      this.ctx.save();
      this.ctx.strokeStyle = s.color || "#fff";
      this.ctx.fillStyle   = s.color || "#fff";
      this.ctx.lineWidth   = s.strokeWidth || 2;
      applyStrokeStyle(this.ctx, s.strokeStyle);

      switch (s.type) {
        case "rectangle":
          this.ctx.strokeRect(s.x, s.y, s.width, s.height);
          break;

        case "diamond":
          drawDiamond(this.ctx, s.x, s.y, s.width, s.height);
          break;

        case "line":
          this.ctx.beginPath();
          this.ctx.moveTo(s.x1, s.y1);
          this.ctx.lineTo(s.x2, s.y2);
          this.ctx.stroke();
          break;

        case "arrow":
          drawArrow(this.ctx, s.x1, s.y1, s.x2, s.y2);
          break;

        case "circle":
          this.ctx.beginPath();
          this.ctx.arc(s.centerX, s.centerY, s.radius, 0, Math.PI * 2);
          this.ctx.stroke();
          break;

        case "ellipse":
          this.ctx.beginPath();
          this.ctx.ellipse(s.centerX, s.centerY, s.radiusX, s.radiusY, 0, 0, Math.PI * 2);
          this.ctx.stroke();
          break;

        case "pencil":
          this.ctx.beginPath();
          for (let i = 0; i < s.points.length - 1; i++) {
            this.ctx.moveTo(s.points[i].x, s.points[i].y);
            this.ctx.lineTo(s.points[i + 1].x, s.points[i + 1].y);
          }
          this.ctx.stroke();
          break;

        case "text":
          this.ctx.font         = `${s.fontSize || 16}px sans-serif`;
          this.ctx.textBaseline = "top";
          this.ctx.fillText(s.text, s.x, s.y);
          break;
      }

      this.ctx.restore();
    }

    // Selection overlay
    if (this.selectedShapeId) {
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (shape) this.drawSelectionWithHandles(shape);
    }

    // Eraser preview
    if (this.tool === "eraser") {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.hoverX, this.hoverY, this.eraserSize, 0, Math.PI * 2);
      this.ctx.strokeStyle = "#fff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  // ────────────────────────────
  // SELECTION + HANDLES
  // Uses getResizeBox (padded) so handles sit outside the shape.
  // ────────────────────────────

  private drawSelectionWithHandles(shape: Shape) {
    const resizeBox = this.getResizeBox(shape);
    if (!resizeBox) return;

    this.ctx.save();

    // Dashed selection rect
    this.ctx.strokeStyle = "#4DA3FF";
    this.ctx.lineWidth   = 1.5;
    this.ctx.setLineDash([6, 3]);
    this.ctx.strokeRect(resizeBox.x, resizeBox.y, resizeBox.width, resizeBox.height);
    this.ctx.setLineDash([]);

    // 8 resize handles
    const handles = this.getHandles(resizeBox);
    for (const pt of Object.values(handles)) {
      this.ctx.fillStyle   = "#fff";
      this.ctx.strokeStyle = "#4DA3FF";
      this.ctx.lineWidth   = 1.5;
      this.ctx.fillRect  (pt.x - HANDLE_SIZE / 2, pt.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      this.ctx.strokeRect(pt.x - HANDLE_SIZE / 2, pt.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    }

    this.ctx.restore();
  }

  // ────────────────────────────
  // HIT TEST
  // ────────────────────────────

  private getShapeAtPosition(pos: { x: number; y: number }): Shape | null {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.isShapeHit(this.shapes[i], pos)) return this.shapes[i];
    }
    return null;
  }

  private isShapeHit(shape: Shape, pos: { x: number; y: number }): boolean {
    const { x, y } = pos;

    switch (shape.type) {
      case "rectangle":
      case "diamond":
      case "text":
        return (
          x >= shape.x && x <= shape.x + (shape.width  || 120) &&
          y >= shape.y && y <= shape.y + (shape.height || 40)
        );

      case "circle":
        return distance(x, y, shape.centerX, shape.centerY) <= shape.radius;

      case "ellipse":
        return distance(x, y, shape.centerX, shape.centerY) <= Math.max(shape.radiusX, shape.radiusY);

      case "line":
      case "arrow":
        return this.pointNearLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);

      case "pencil":
        return shape.points.some((pt, i) => {
          if (i === 0) return false;
          return this.pointNearLine(x, y, shape.points[i - 1].x, shape.points[i - 1].y, pt.x, pt.y);
        });

      default:
        return false;
    }
  }

  private pointNearLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot   = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    const xx = param < 0 ? x1 : param > 1 ? x2 : x1 + param * C;
    const yy = param < 0 ? y1 : param > 1 ? y2 : y1 + param * D;

    return distance(px, py, xx, yy) <= this.eraserSize;
  }

  // ────────────────────────────
  // EVENTS
  // ────────────────────────────

  private getPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onMouseDown = (e: MouseEvent) => {
    const pos = this.getPos(e);
    this.moved = false;

    // TEXT tool
    if (this.tool === "text" && this.textarea) {
      this.textX = pos.x;
      this.textY = pos.y;
      this.selectedShapeId = null;
      this.textarea.style.display = "block";
      this.textarea.style.left    = `${pos.x}px`;
      this.textarea.style.top     = `${pos.y}px`;
      this.isTyping = true;
      setTimeout(() => this.textarea?.focus(), 0);
      return;
    }

    // ERASER
    if (this.tool === "eraser") {
      this.clicked = true;
      return;
    }

    // SELECT
    if (this.tool === "select") {

      // Double-click: open text editor
      if (e.detail >= 2) {
        const shape = this.getShapeAtPosition(pos);
        if (shape?.type === "text" && this.textarea) {
          this.selectedShapeId = shape.id;
          this.textarea.style.display = "block";
          this.textarea.style.left    = `${shape.x}px`;
          this.textarea.style.top     = `${shape.y}px`;
          this.textarea.value = shape.text;
          this.isTyping = true;
          setTimeout(() => this.textarea?.focus(), 0);
          return;
        }
      }

      // Check resize handle on the already-selected shape
      if (this.selectedShapeId) {
        const selected = this.shapes.find(s => s.id === this.selectedShapeId);
        if (selected) {
          const resizeBox = this.getResizeBox(selected);
          if (resizeBox) {
            const handle = this.hitHandle(pos, resizeBox);
            if (handle) {
              this.isResizing     = true;
              this.resizeHandle   = handle;
              // ✅ Snapshot the padded resize box — applyResize expects this
              this.resizeStartBox = { ...resizeBox };
              this.resizeOriginX  = pos.x;
              this.resizeOriginY  = pos.y;
              return;
            }
          }
        }
      }

      // Select or deselect
      const shape = this.getShapeAtPosition(pos);

      if (!shape) {
        this.selectedShapeId = null;
        this.redraw();
        return;
      }

      this.selectedShapeId = shape.id;
      this.isDragging  = true;
      this.dragStartX  = pos.x;
      this.dragStartY  = pos.y;
      this.redraw();
      return;
    }

    // DRAWING tools
    this.clicked = true;
    this.startX  = pos.x;
    this.startY  = pos.y;

    if (this.tool === "pencil") this.path = [pos];
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isTyping) return;

    const pos = this.getPos(e);
    this.hoverX = pos.x;
    this.hoverY = pos.y;

    // Cursor update when hovering over handles
    if (this.tool === "select" && this.selectedShapeId && !this.isDragging && !this.isResizing) {
      const selected = this.shapes.find(s => s.id === this.selectedShapeId);
      if (selected) {
        const resizeBox = this.getResizeBox(selected);
        if (resizeBox) {
          const handle = this.hitHandle(pos, resizeBox);
          this.canvas.style.cursor = handle
            ? this.handleCursor(handle)
            : this.isShapeHit(selected, pos) ? "move" : "default";
        }
      }
    }

    // ERASER
    if (this.tool === "eraser") {
      this.redraw();
      if (!this.clicked) return;
      const newShapes: Shape[] = [];
      for (const shape of this.shapes) {
        if (this.isShapeHit(shape, pos)) {
          this.sendErase(shape.id);
        } else {
          newShapes.push(shape);
        }
      }
      this.shapes = newShapes;
      this.redraw();
      return;
    }

    // RESIZE
    if (this.tool === "select" && this.isResizing && this.resizeHandle && this.resizeStartBox) {
      const dx = pos.x - this.resizeOriginX;
      const dy = pos.y - this.resizeOriginY;

      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;

      this.applyResize(shape, this.resizeHandle, { ...this.resizeStartBox }, dx, dy);
      this.moved = true;
      this.redraw();
      return;
    }

    // DRAG
    if (this.tool === "select" && this.isDragging) {
      const dx = pos.x - this.dragStartX;
      const dy = pos.y - this.dragStartY;

      if (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold) {
        this.moved = true;
      }

      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;

      switch (shape.type) {
        case "rectangle":
        case "diamond":
        case "text":
          shape.x += dx; shape.y += dy;
          break;
        case "line":
        case "arrow":
          shape.x1 += dx; shape.x2 += dx;
          shape.y1 += dy; shape.y2 += dy;
          break;
        case "circle":
        case "ellipse":
          shape.centerX += dx; shape.centerY += dy;
          break;
        case "pencil":
          shape.points = shape.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
          break;
      }

      this.dragStartX = pos.x;
      this.dragStartY = pos.y;
      this.redraw();
      return;
    }

    // Live preview while drawing
    if (!this.clicked) { this.redraw(); return; }

    this.redraw();

    this.ctx.save();
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth   = this.strokeWidth;
    applyStrokeStyle(this.ctx, this.strokeStyle);

    const dx = pos.x - this.startX;
    const dy = pos.y - this.startY;

    switch (this.tool) {
      case "rectangle":
        this.ctx.strokeRect(this.startX, this.startY, dx, dy);
        break;

      case "diamond":
        drawDiamond(this.ctx, this.startX, this.startY, dx, dy);
        break;

      case "line":
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        break;

      case "arrow":
        drawArrow(this.ctx, this.startX, this.startY, pos.x, pos.y);
        break;

      case "circle":
        if (e.shiftKey) {
          this.ctx.beginPath();
          this.ctx.arc(this.startX, this.startY, Math.sqrt(dx * dx + dy * dy), 0, Math.PI * 2);
          this.ctx.stroke();
        } else {
          this.ctx.beginPath();
          this.ctx.ellipse(this.startX, this.startY, Math.abs(dx), Math.abs(dy), 0, 0, Math.PI * 2);
          this.ctx.stroke();
        }
        break;

      case "pencil":
        this.path.push(pos);
        this.ctx.beginPath();
        for (let i = 0; i < this.path.length - 1; i++) {
          this.ctx.moveTo(this.path[i].x, this.path[i].y);
          this.ctx.lineTo(this.path[i + 1].x, this.path[i + 1].y);
        }
        this.ctx.stroke();
        break;
    }

    this.ctx.restore();
  };

  private onMouseUp = (e: MouseEvent) => {
    const pos = this.getPos(e);

    // End resize
    if (this.tool === "select" && this.isResizing) {
      this.isResizing     = false;
      this.resizeHandle   = null;
      this.resizeStartBox = null;
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (shape && this.moved) this.sendUpdate(shape);
      this.canvas.style.cursor = "default";
      this.redraw();
      return;
    }

    // End drag
    if (this.tool === "select" && this.isDragging) {
      this.isDragging = false;
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (shape && this.moved) this.sendUpdate(shape);
      this.canvas.style.cursor = "default";
      return;
    }

    if (!this.clicked) return;
    this.clicked = false;
    if (this.tool === "eraser") return;

    const dx = pos.x - this.startX;
    const dy = pos.y - this.startY;

    let shape: Shape | null = null;

    switch (this.tool) {
      case "rectangle":
        shape = {
          id: crypto.randomUUID(), type: "rectangle",
          x: this.startX, y: this.startY, width: dx, height: dy,
          color: this.color, strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle,
        };
        break;

      case "diamond":
        shape = {
          id: crypto.randomUUID(), type: "diamond",
          x: this.startX, y: this.startY, width: dx, height: dy,
          color: this.color, strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle,
        };
        break;

      case "line":
        shape = {
          id: crypto.randomUUID(), type: "line",
          x1: this.startX, y1: this.startY, x2: pos.x, y2: pos.y,
          color: this.color, strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle,
        };
        break;

      case "arrow":
        shape = {
          id: crypto.randomUUID(), type: "arrow",
          x1: this.startX, y1: this.startY, x2: pos.x, y2: pos.y,
          color: this.color, strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle,
        };
        break;

      case "circle":
        if (e.shiftKey) {
          shape = {
            id: crypto.randomUUID(), type: "circle",
            centerX: this.startX, centerY: this.startY,
            radius: Math.sqrt(dx * dx + dy * dy),
            color: this.color, strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle,
          };
        } else {
          shape = {
            id: crypto.randomUUID(), type: "ellipse",
            centerX: this.startX, centerY: this.startY,
            radiusX: Math.abs(dx), radiusY: Math.abs(dy),
            color: this.color, strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle,
          };
        }
        break;

      case "pencil":
        shape = {
          id: crypto.randomUUID(), type: "pencil",
          points: this.path,
          color: this.color, strokeWidth: this.strokeWidth, strokeStyle: this.strokeStyle,
        };
        break;
    }

    if (!shape) return;

    this.shapes.push(shape);
    this.redraw();
    this.send(shape);
  };

  private onMouseLeave = () => {
    this.clicked    = false;
    this.isDragging = false;
    this.canvas.style.cursor = "default";
    this.redraw();
  };

  // ────────────────────────────
  // ATTACH / DESTROY
  // ────────────────────────────

  private attachEvents() {
    this.canvas.addEventListener("mousedown",  this.onMouseDown);
    this.canvas.addEventListener("mousemove",  this.onMouseMove);
    this.canvas.addEventListener("mouseup",    this.onMouseUp);
    this.canvas.addEventListener("mouseleave", this.onMouseLeave);
  }

  public destroy() {
    this.canvas.removeEventListener("mousedown",  this.onMouseDown);
    this.canvas.removeEventListener("mousemove",  this.onMouseMove);
    this.canvas.removeEventListener("mouseup",    this.onMouseUp);
    this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
    this.cleanupSocket?.();
  }
}
