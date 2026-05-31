
export interface Layer {
  id:       string;
  name:     string;
  visible:  boolean;
  locked:   boolean;
  /** z-order: lower index = drawn first (bottom) */
  order:    number;
}

export class LayerService {
  private layers: Map<string, Layer> = new Map();
  private _order: string[] = [];  // ids in draw order (index 0 = bottom)

  /** Default layer id — every shape without a layerId goes here */
  public readonly defaultLayerId: string;

  constructor() {
    const def = this.add("Default");
    this.defaultLayerId = def.id;
  }

  // ── CRUD ────────────────────────────────────────────────────────────────

  public add(name: string): Layer {
    const layer: Layer = {
      id:      crypto.randomUUID(),
      name,
      visible: true,
      locked:  false,
      order:   this._order.length,
    };
    this.layers.set(layer.id, layer);
    this._order.push(layer.id);
    return layer;
  }

  public remove(id: string) {
    if (id === this.defaultLayerId) return; // can't remove default
    this.layers.delete(id);
    this._order = this._order.filter(i => i !== id);
    this.reorder();
  }

  public rename(id: string, name: string) {
    const l = this.layers.get(id);
    if (l) l.name = name;
  }

  // ── Visibility / Lock ────────────────────────────────────────────────────

  public setVisible(id: string, visible: boolean) {
    const l = this.layers.get(id);
    if (l) l.visible = visible;
  }

  public setLocked(id: string, locked: boolean) {
    const l = this.layers.get(id);
    if (l) l.locked = locked;
  }

  public toggleVisible(id: string) {
    const l = this.layers.get(id);
    if (l) l.visible = !l.visible;
  }

  public toggleLocked(id: string) {
    const l = this.layers.get(id);
    if (l) l.locked = !l.locked;
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  /**
   * Returns true if the layer is visible.
   * Shapes with no layerId are treated as belonging to the default layer.
   */
  public isVisible(layerId?: string): boolean {
    const id = layerId ?? this.defaultLayerId;
    return this.layers.get(id)?.visible ?? true;
  }

  public isLocked(layerId?: string): boolean {
    const id = layerId ?? this.defaultLayerId;
    return this.layers.get(id)?.locked ?? false;
  }

  public get(id: string): Layer | undefined {
    return this.layers.get(id);
  }

  /** All layers in draw order (bottom to top) */
  public getAll(): Layer[] {
    return this._order
      .map(id => this.layers.get(id)!)
      .filter(Boolean);
  }

  // ── Z-order ──────────────────────────────────────────────────────────────

  public moveUp(id: string) {
    const idx = this._order.indexOf(id);
    if (idx < this._order.length - 1) {
      [this._order[idx], this._order[idx + 1]] = [this._order[idx + 1], this._order[idx]];
      this.reorder();
    }
  }

  public moveDown(id: string) {
    const idx = this._order.indexOf(id);
    if (idx > 0) {
      [this._order[idx], this._order[idx - 1]] = [this._order[idx - 1], this._order[idx]];
      this.reorder();
    }
  }

  private reorder() {
    this._order.forEach((id, i) => {
      const l = this.layers.get(id);
      if (l) l.order = i;
    });
  }
}