
import { Shape } from "@/types/DrawingShapesTypes";

export class HistoryService {
  private undoStack: Shape[][] = [];
  private redoStack: Shape[][] = [];
  private maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  /** Call this whenever shapes change (after draw, move, resize, delete). */
  public push(shapes: Shape[]) {
    this.undoStack.push(this.clone(shapes));
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
    // A new action always clears redo
    this.redoStack = [];
  }

  /**
   * Returns the previous state, or null if nothing to undo.
   * Pass in current shapes so we can push them onto the redo stack.
   */
  public undo(current: Shape[]): Shape[] | null {
    if (this.undoStack.length === 0) return null;
    this.redoStack.push(this.clone(current));
    return this.undoStack.pop()!;
  }

  /**
   * Returns the next state, or null if nothing to redo.
   * Pass in current shapes so we can push them onto the undo stack.
   */
  public redo(current: Shape[]): Shape[] | null {
    if (this.redoStack.length === 0) return null;
    this.undoStack.push(this.clone(current));
    return this.redoStack.pop()!;
  }

  public canUndo(): boolean { return this.undoStack.length > 0; }
  public canRedo(): boolean { return this.redoStack.length > 0; }

  /** Number of snapshots available */
  public get undoCount(): number { return this.undoStack.length; }
  public get redoCount(): number { return this.redoStack.length; }

  /** Reset everything (called on resetCanvas) */
  public clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  /** Returns a read-only preview of all undo states (for a history panel UI) */
  public getHistory(): Readonly<Shape[][]> {
    return this.undoStack;
  }

  private clone(shapes: Shape[]): Shape[] {
    // structuredClone is available in modern browsers & Node 17+
    return structuredClone(shapes);
  }
}