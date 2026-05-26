import { Shape } from "@/types/DrawingShapesTypes";
import { drawDiamond } from "../util/Diamand";
import { drawArrow } from "../util/Drawarrow";
import { applyStrokeStyle } from "../util/StrokeStyle";

/**
 * Redraws all shapes onto the canvas using raw pixel coordinates.
 
 */


export function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, W, H);

  for (const shape of existingShapes) {
    ctx.save();
    ctx.strokeStyle = shape.color || "#fff";
    ctx.fillStyle   = shape.color || "#fff";
    ctx.lineWidth   = shape.strokeWidth ?? 1.5;

    applyStrokeStyle(ctx, shape.strokeStyle);

    switch (shape.type) {
      case "rectangle":
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;

      case "diamond":
        drawDiamond(ctx, shape.x, shape.y, shape.width, shape.height);
        break;

      case "circle":
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(
          shape.centerX, shape.centerY,
          shape.radiusX, shape.radiusY,
          0, 0, Math.PI * 2
        );
        ctx.stroke();
        break;

      case "text":
        ctx.font         = `${shape.fontSize || 16}px sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillStyle    = shape.color || "#fff";
        ctx.fillText(shape.text, shape.x, shape.y);
        break;

      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
        break;

      case "arrow":
        drawArrow(ctx, shape.x1, shape.y1, shape.x2, shape.y2);
        break;

      case "pencil":
        if (shape.points.length < 2) break;
        ctx.beginPath();
        for (let i = 0; i < shape.points.length - 1; i++) {
          ctx.moveTo(shape.points[i].x,     shape.points[i].y);
          ctx.lineTo(shape.points[i + 1].x, shape.points[i + 1].y);
        }
        ctx.stroke();
        break;
    }

    ctx.restore();
  }
}