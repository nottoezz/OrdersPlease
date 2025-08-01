import * as THREE from "three";

// --------------------------------------------
// TVOverlay - CRT-style Text Display for TV Screen
// --------------------------------------------
export class TVOverlay {
  constructor(tvMaterial) {
    // Abort if no material is provided
    if (!tvMaterial) {
      console.warn("TVOverlay: No material provided!");
      return;
    }

    // Create canvas element for dynamic text rendering
    this.canvas = document.createElement("canvas");
    this.canvas.width = 256;
    this.canvas.height = 128;
    this.ctx = this.canvas.getContext("2d");

    // Ensure canvas context is valid
    if (!this.ctx) {
      console.error("TVOverlay: Failed to get canvas context");
      return;
    }

    // Create Three.js texture from the canvas
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;
    this.texture.minFilter = THREE.LinearFilter;

    // Apply texture to material as map and emissiveMap
    tvMaterial.map = this.texture;
    tvMaterial.emissiveMap = this.texture;
    tvMaterial.color = new THREE.Color(0x000000);
    tvMaterial.emissive = new THREE.Color(0x00ff00);
    tvMaterial.emissiveIntensity = 1.2;
    tvMaterial.needsUpdate = true;

    // Store reference for future updates
    this.material = tvMaterial;

    // Initial text display
    this.displayText("Awaiting Order...");
  }

  // --------------------------------------------
  // Update TV Screen Text
  // --------------------------------------------
  displayText(text) {
    const maxWidth = this.canvas.width - 20;
    const lineHeight = 18;
    const maxLines = 5;

    // Clear the canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Style text
    this.ctx.font = "bold 14px Courier New";
    this.ctx.fillStyle = "#00ff00";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // --------------------------------------------
    // Word Wrap Helper
    // --------------------------------------------
    const wrapText = (text) => {
      const words = text.split(" ");
      const lines = [];
      let line = "";

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const testWidth = this.ctx.measureText(testLine).width;

        if (testWidth > maxWidth && line) {
          lines.push(line.trim());
          line = words[i] + " ";
        } else {
          line = testLine;
        }
      }

      lines.push(line.trim());
      return lines.slice(0, maxLines);
    };

    // Calculate layout and render wrapped lines
    const wrappedLines = wrapText(text);
    const totalHeight = wrappedLines.length * lineHeight;

    for (let i = 0; i < wrappedLines.length; i++) {
      const y = this.canvas.height / 2 - totalHeight / 2 + i * lineHeight;
      this.ctx.fillText(wrappedLines[i], this.canvas.width / 2, y);
    }

    // Flag texture for update
    this.texture.needsUpdate = true;
  }
}
