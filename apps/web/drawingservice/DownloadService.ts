// ─────────────────────────────────────────────────────────────────────────────
// DownloadService.ts
// Exports the canvas as PNG, JPEG, SVG, or raw JSON shape data.

import { Shape } from "@/types/DrawingShapesTypes";

export type DownloadFormat = "png" | "jpeg" | "json";

export class DownloadService {
  private canvas: HTMLCanvasElement;
  private shapes: Shape[];

  constructor(canvas: HTMLCanvasElement, shapes: Shape[]) {
    this.canvas = canvas;
    this.shapes = shapes;
  }

  /** Download the canvas in the requested format */
  public download(format: DownloadFormat = "png") {
    switch (format) {
      case "png":
        return this.downloadImage("image/png", "sketch.png");

      case "jpeg":
        return this.downloadImage("image/jpeg", "sketch.jpg");

      case "json":
        return this.downloadJSON();
    }
  }

  // ── PNG / JPEG ─────────────────────────────────────────────────────────────

  private downloadImage(mimeType: string, filename: string) {
    // We need to flatten the canvas onto a white/black background
    // because canvas.toDataURL loses the filled background
    const offscreen = document.createElement("canvas");
    offscreen.width  = this.canvas.width;
    offscreen.height = this.canvas.height;

    const ctx = offscreen.getContext("2d")!;
    // Mirror DPR scale
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    // Copy the live canvas on top
    ctx.drawImage(this.canvas, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    const dataUrl = offscreen.toDataURL(mimeType, 0.95);
    this.triggerDownload(dataUrl, filename);
  }

  // ── JSON ───────────────────────────────────────────────────────────────────

  private downloadJSON() {
    // Strip image src blobs (too large) — store shape type only, or keep if desired
    const exportable = this.shapes.map(s => {
      if (s.type === "image") {
        const { src: _src, ...rest } = s as any;
        return { ...rest, src: "[base64 omitted]" };
      }
      return s;
    });

    const json    = JSON.stringify(exportable, null, 2);
    const blob    = new Blob([json], { type: "application/json" });
    const dataUrl = URL.createObjectURL(blob);
    this.triggerDownload(dataUrl, "sketch.json");
    setTimeout(() => URL.revokeObjectURL(dataUrl), 5000);
  }

  // ── Helper ─────────────────────────────────────────────────────────────────

  private triggerDownload(href: string, filename: string) {
    const a    = document.createElement("a");
    a.href     = href;
    a.download = filename;
    a.click();
  }
}