
import { Shape } from "@/types/DrawingShapesTypes";

export class ImageService {
  private shapes: Shape[];
  private redraw: () => void;
  private send: (shape: Shape) => void;

  constructor(
    shapes: Shape[],
    redraw: () => void,
    send: (shape: Shape) => void
  ) {
    this.shapes = shapes;
    this.redraw = redraw;
    this.send   = send;
  }

  /** Opens a native file picker and inserts the chosen image onto the canvas */
  public openFilePicker() {
    const input = document.createElement("input");
    input.type   = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.loadFile(file);
    };

    input.click();
  }

  private loadFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        // Place image centred at (200, 200), preserving aspect ratio up to 400px wide
        const maxW  = 400;
        const scale = Math.min(1, maxW / img.naturalWidth);
        const w     = img.naturalWidth  * scale;
        const h     = img.naturalHeight * scale;

        const shape: Shape = {
          id:     crypto.randomUUID(),
          type:   "image",
          x:      200,
          y:      200,
          width:  w,
          height: h,
          src:    dataUrl,
          color:  "#fff",
        };

        this.shapes.push(shape);
        this.redraw();
        this.send(shape);
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  }

  /**
   * Draw an image shape onto a canvas context.
   * Call this inside your SketchEngine redraw loop:
   *
   *   case "image":
   *     ImageService.drawShape(ctx, s);
   *     break;
   */
  public static drawShape(
    ctx: CanvasRenderingContext2D,
    shape: Shape & { type: "image" }
  ) {
    const img    = new Image();
    img.src      = shape.src;

    // If already cached the browser draws instantly, otherwise it
    // fires onload and triggers a repaint via the dirty flag.
    if (img.complete) {
      ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
    } else {
      img.onload = () => {
        // The engine's next redraw will pick it up from cache
        ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
      };
    }
  }
}