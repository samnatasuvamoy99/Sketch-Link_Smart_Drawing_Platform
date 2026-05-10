import { Shape, StrokeStyle } from "@/types/DrawingShapesTypes";
import { drawDiamond } from "@/drawingservice/util/Diamand";
import { drawArrow } from "@/drawingservice/util/Drawarrow";
import { applyStrokeStyle } from "@/drawingservice/util/StrokeStyle";
import { distance } from "../util/PixelHitPoint";

export class SketchEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private socket?: WebSocket;
  private roomId?: string;
  private textarea?: HTMLTextAreaElement | null;

  private shapes: Shape[] = [];
  private path: { x: number; y: number }[] = [];

  private tool = "pencil";
  private color = "#fff";
  private strokeWidth = 2;
  private strokeStyle?: StrokeStyle;
  private eraserSize = 10;
  private cleanupSocket?: () => void;

  private clicked = false;
  private startX = 0;
  private startY = 0;
  private isTyping = false;
  private textX = 0;
  private textY = 0;


private isDragging = false;
private selectedShapeId: string | null = null;
private dragStartX = 0;
private dragStartY = 0;

  constructor(
    canvas: HTMLCanvasElement,
    options?: {
      socket?: WebSocket;
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

  // ================= CANVAS =================
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


  private getShapeAtPosition(pos: { x: number; y: number }) {

  for (let i = this.shapes.length - 1; i >= 0; i--) {

    const shape = this.shapes[i];

    if (this.isShapeHit(shape, pos)) {
      return shape;
    }
  }

  return null;
}


  // ================= SETTERS =================
  setTool(t: string) { this.tool = t; }
  setColor(c: string) { this.color = c; }
  setStroke(w: number) { this.strokeWidth = w; }
  setStrokeStyle(s: StrokeStyle) { this.strokeStyle = s; }

  // ================= SOCKET =================
  private setupSocket() {
    if (!this.socket) return;

    const handler = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.type === "realtime_drawing") {
        const shape = JSON.parse(data.coordinate)?.shape;
        if (shape && data.roomId === this.roomId) {
          this.shapes.push(shape);
          this.redraw();
        }
      }

      if (data.type === "erase" && data.roomId === this.roomId) {
        this.shapes = this.shapes.filter(s => s.id !== data.shapeId);
        this.redraw();
      }

      // reset...
     if (data.type === "reset_canvas") {

      if (data.roomId === this.roomId) {

        this.shapes = [];

        this.redraw();
      }
    }
    };

    this.socket.addEventListener("message", handler);

    this.cleanupSocket = () => {
      this.socket?.removeEventListener("message", handler);
    };
  }


  //  RESET 
public resetCanvas() {

  // CLEAR LOCAL SHAPES
  this.shapes = [];

  // REDRAW EMPTY CANVAS
  this.redraw();

  // SEND RESET TO OTHER USERS
  if (this.socket && this.roomId) {
    this.socket.send(
      JSON.stringify({
        type: "reset_canvas",
        roomId: this.roomId,
      })
    );
  }
}


  private sendErase(shapeId: string) {
    if (!this.socket) return;
    this.socket.send(JSON.stringify({
      type: "erase",
      roomId: this.roomId,
      shapeId,
    }));
  }

  private send(shape: Shape) {
    if (!this.socket) return;
    this.socket.send(JSON.stringify({
      type: "realtime_drawing",
      coordinate: JSON.stringify({ shape }),
      roomId: this.roomId,
    }));
  }

  private sendUpdate(shape: Shape) {

  if (!this.socket) return;

  this.socket.send(
    JSON.stringify({
      type: "shape_update",
      roomId: this.roomId,
      coordinate: JSON.stringify({ shape }),
    })
  );
}


  // ================= TEXT =================
  private setupTextarea() {
    if (!this.textarea) return;

    this.textarea.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.commitText();
      }
    };

    this.textarea.onblur = () => {
      this.commitText();
    };
  }

  private commitText() {
    if (!this.textarea) return;

    const value = this.textarea.value.trim();
    if (!value) {
      this.hideTextarea();
      return;
    }

    const shape: Shape = {
      id: crypto.randomUUID(),
      type: "text",
      x: this.textX,
      y: this.textY,
      text: value,
      color: this.color,
      fontSize: 16,
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
  }

  // ================= DRAW =================
  private redraw() {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, displayWidth, displayHeight);

    for (const s of this.shapes) {
      this.ctx.save();

      this.ctx.strokeStyle = s.color || "#fff";
      this.ctx.lineWidth = s.strokeWidth || 2;
      applyStrokeStyle(this.ctx, s.strokeStyle);

      switch (s.type) {
        case "rectangle":
          this.ctx.strokeRect(s.x, s.y, s.width, s.height);
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

        case "diamond":
          drawDiamond(this.ctx, s.x, s.y, s.width, s.height);
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
          this.ctx.fillStyle = s.color || "#fff";
          this.ctx.font = `${s.fontSize || 16}px sans-serif`;
          this.ctx.textBaseline = "top";
          this.ctx.fillText(s.text, s.x, s.y);
          break;
      }

      this.ctx.restore();
    }
  }

  // ================= ERASER CURSOR =================
  private drawEraserCursor(x: number, y: number) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.eraserSize, 0, Math.PI * 2);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.stroke();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    this.ctx.fill();
    this.ctx.restore();
  }

  // ================= HIT TESTING =================
  private pointNearLine(
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): boolean {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx: number, yy: number;

    if (param < 0) {
      xx = x1; yy = y1;
    } else if (param > 1) {
      xx = x2; yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    return distance(px, py, xx, yy) <= this.eraserSize;
  }

  private isShapeHit(shape: Shape, pos: { x: number; y: number }): boolean {
    const { x, y } = pos;

    switch (shape.type) {
      case "pencil":
        return shape.points.some((pt, i) => {
          if (i === 0) return false;
          return this.pointNearLine(
            x, y,
            shape.points[i - 1].x, shape.points[i - 1].y,
            pt.x, pt.y
          );
        });

      case "rectangle":
        return (
          x >= shape.x - this.eraserSize &&
          x <= shape.x + shape.width + this.eraserSize &&
          y >= shape.y - this.eraserSize &&
          y <= shape.y + shape.height + this.eraserSize
        );

      case "circle":
        return (
          distance(x, y, shape.centerX, shape.centerY) <=
          shape.radius + this.eraserSize
        );

      case "line":
      case "arrow":
        return this.pointNearLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);

      case "ellipse":
        return (
          distance(x, y, shape.centerX, shape.centerY) <=
          Math.max(shape.radiusX, shape.radiusY) + this.eraserSize
        );

      case "diamond":
        return (
          x >= shape.x - this.eraserSize &&
          x <= shape.x + shape.width + this.eraserSize &&
          y >= shape.y - this.eraserSize &&
          y <= shape.y + shape.height + this.eraserSize
        );

      case "text":
        return (
          x >= shape.x - this.eraserSize &&
          x <= shape.x + 100 &&
          y >= shape.y - this.eraserSize &&
          y <= shape.y + 30
        );

      default:
        return false;
    }
  }

  // ================= EVENTS =================
  private getPos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onMouseDown = (e: MouseEvent) => {
    const pos = this.getPos(e);

    // ================= SELECT TOOL =================

if (this.tool === "select") {

  const shape = this.getShapeAtPosition(pos);

  if (!shape) {
    this.selectedShapeId = null;
    this.redraw();
    return;
  }

  this.selectedShapeId = shape.id;

  // START DRAGGING
  this.isDragging = true;

  this.dragStartX = pos.x;
  this.dragStartY = pos.y;

  this.redraw();

  return;
}

    if (this.tool === "text" && this.textarea) {
      this.textX = pos.x;
      this.textY = pos.y;
      this.textarea.style.display = "block";
      this.textarea.style.left = `${pos.x}px`;
      this.textarea.style.top = `${pos.y}px`;
      this.isTyping = true;
      setTimeout(() => this.textarea?.focus(), 0);
      return;
    }

    this.clicked = true;
    this.startX = pos.x;
    this.startY = pos.y;

    if (this.tool === "pencil") {
      this.path = [pos];
    }

  };

  private onMouseUp = (e: MouseEvent) => {
    if (!this.clicked) return;
    this.clicked = false;

    const pos = this.getPos(e);

// ================= STOP SELECT DRAG =================

if (this.tool === "select") {

  this.isDragging = false;

  const shape = this.shapes.find(
    s => s.id === this.selectedShapeId
  );

  if (shape) {
    this.sendUpdate(shape);
  }

  return;
}

    const dx = pos.x - this.startX;
    const dy = pos.y - this.startY;

    // Eraser doesn't create shapes
    if (this.tool === "eraser") return;

    let shape: Shape | null = null;

    switch (this.tool) {
      case "rectangle":
        shape = {
          id: crypto.randomUUID(),
          type: "rectangle",
          x: this.startX,
          y: this.startY,
          width: dx,
          height: dy,
          color: this.color,
          strokeWidth: this.strokeWidth,
          strokeStyle: this.strokeStyle,
        };
        break;

      case "line":
        shape = {
          id: crypto.randomUUID(),
          type: "line",
          x1: this.startX,
          y1: this.startY,
          x2: pos.x,
          y2: pos.y,
          color: this.color,
          strokeWidth: this.strokeWidth,
          strokeStyle: this.strokeStyle,
        };
        break;

      case "arrow":
        shape = {
          id: crypto.randomUUID(),
          type: "arrow",
          x1: this.startX,
          y1: this.startY,
          x2: pos.x,
          y2: pos.y,
          color: this.color,
          strokeWidth: this.strokeWidth,
          strokeStyle: this.strokeStyle,
        };
        break;

      case "diamond":
        shape = {
          id: crypto.randomUUID(),
          type: "diamond",
          x: this.startX,
          y: this.startY,
          width: dx,
          height: dy,
          color: this.color,
          strokeWidth: this.strokeWidth,
          strokeStyle: this.strokeStyle,
        };
        break;

      case "circle":
        if (e.shiftKey) {
          shape = {
            id: crypto.randomUUID(),
            type: "circle",
            centerX: this.startX,
            centerY: this.startY,
            radius: Math.sqrt(dx * dx + dy * dy),
            color: this.color,
            strokeWidth: this.strokeWidth,
            strokeStyle: this.strokeStyle,
          };
        } else {
          shape = {
            id: crypto.randomUUID(),
            type: "ellipse",
            centerX: this.startX,
            centerY: this.startY,
            radiusX: Math.abs(dx),
            radiusY: Math.abs(dy),
            color: this.color,
            strokeWidth: this.strokeWidth,
            strokeStyle: this.strokeStyle,
          };
        }
        break;

      case "pencil":
        shape = {
          id: crypto.randomUUID(),
          type: "pencil",
          points: this.path,
          color: this.color,
          strokeWidth: this.strokeWidth,
          strokeStyle: this.strokeStyle,
        };
        break;
    }

    if (!shape) return;

    if (!this.shapes.find(s => s.id === shape!.id)) {
      this.shapes.push(shape);
      this.redraw();
    }
    this.send(shape);


  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isTyping) return; // ← only block typing, NOT all non-clicked states

    const pos = this.getPos(e);

    // ── ERASER ──────────────────────────────────────────────
    if (this.tool === "eraser") {
     
  
      this.drawEraserCursor(pos.x, pos.y);

     
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
      this.drawEraserCursor(pos.x, pos.y);
      return;
    }

    // ── ALL OTHER TOOLS ──────────────────────────────────────
    if (!this.clicked) return;

    this.redraw();
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.strokeWidth;
    applyStrokeStyle(this.ctx, this.strokeStyle);

    const dx = pos.x - this.startX;
    const dy = pos.y - this.startY;

    switch (this.tool) {
      case "rectangle":
        this.ctx.strokeRect(this.startX, this.startY, dx, dy);
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

      case "diamond":
        drawDiamond(this.ctx, this.startX, this.startY, dx, dy);
        break;

      case "circle":
        if (e.shiftKey) {
          this.ctx.beginPath();
          this.ctx.arc(this.startX, this.startY, Math.sqrt(dx * dx + dy * dy), 0, Math.PI * 2);
        } else {
          this.ctx.beginPath();
          this.ctx.ellipse(this.startX, this.startY, Math.abs(dx), Math.abs(dy), 0, 0, Math.PI * 2);
        }
        this.ctx.stroke();
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


 
  };

  private onMouseLeave = () => {
    // Clear the eraser cursor ring when mouse exits canvas
    this.redraw();
  };

  private attachEvents() {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseleave", this.onMouseLeave);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
    this.cleanupSocket?.();
  }
}