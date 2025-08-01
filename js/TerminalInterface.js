// --------------------------------------------
// Terminal Interface Class
// --------------------------------------------
import * as THREE from "three";
import { currentView } from "./main.js";
import { showPrompt } from "./utility.js";

export class TerminalInterface {
  constructor(targetMaterial, camera, transitionCallback) {
    // --------------------------------------------
    // State Setup
    // --------------------------------------------
    this.transitionTo = transitionCallback;
    this.locked = false;
    this.canPlayWalkie = false;

    // --------------------------------------------
    // Terminal Canvas Setup
    // --------------------------------------------
    this.canvas = document.createElement("canvas");
    this.canvas.width = 512;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext("2d");

    this.inputText = "user@pc:~$ ";
    this.lines = [];
    this.active = false;
    this.blinkState = true;
    this.maxLines = 10;
    this.lineHeight = 20;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;
    this.texture.minFilter = THREE.LinearFilter;

    targetMaterial.map = this.texture;
    targetMaterial.emissiveMap = this.texture;
    targetMaterial.color = new THREE.Color(0x000000);
    targetMaterial.emissive = new THREE.Color(0x00ff00);
    targetMaterial.emissiveIntensity = 1.2;
    targetMaterial.needsUpdate = true;
    this.material = targetMaterial;

    // --------------------------------------------
    // Audio Setup
    // --------------------------------------------
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.keystrokeSounds = [];
    this.suppressKeystrokeSound = false;

    const audioLoader = new THREE.AudioLoader();
    for (let i = 0; i <= 5; i++) {
      const sound = new THREE.Audio(this.listener);
      audioLoader.load(
        `audio/keystrokes/keystroke0${i}.mp3`,
        (buffer) => {
          sound.setBuffer(buffer);
          sound.setVolume(0.3);
        },
        undefined,
        (err) => console.warn("Audio load error:", err)
      );
      this.keystrokeSounds.push(sound);
    }

    // Unlock Web Audio on user gesture
    document.addEventListener(
      "click",
      () => {
        if (this.listener.context.state === "suspended") {
          this.listener.context.resume();
        }
      },
      { once: true }
    );

    // --------------------------------------------
    // Startup Behavior
    // --------------------------------------------
    this.flashInterval = setInterval(() => this.drawFlash(), 500);
    window.addEventListener("keydown", (e) => this.handleKey(e));
    this.initOrderManager();
  }

  // --------------------------------------------
  // Flashing "CLICK ME" Prompt
  // --------------------------------------------
  drawFlash() {
    if (this.active) return;
    this.blinkState = !this.blinkState;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.blinkState) {
      this.ctx.font = "bold 24px Courier New";
      this.ctx.fillStyle = "#00ff00";
      this.ctx.textAlign = "center";
      this.ctx.fillText("CLICK ME", this.canvas.width / 2, this.canvas.height / 2);
    }

    this.texture.needsUpdate = true;
  }

  // --------------------------------------------
  // Activate Terminal Mode
  // --------------------------------------------
  activate() {
    this.active = true;
    clearInterval(this.flashInterval);
    this.draw();
    showPrompt("try typing something in the terminal");
  }

  // --------------------------------------------
  // Draw Terminal Text State
  // --------------------------------------------
  draw() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = "12px monospace";
    this.ctx.fillStyle = "#00ff00";
    this.ctx.textAlign = "left";

    const visibleLines = this.lines.slice(-this.maxLines);
    visibleLines.forEach((line, i) => {
      this.ctx.fillText(line, 10, this.canvas.height - (this.maxLines - i + 1) * this.lineHeight);
    });

    this.ctx.fillText(this.inputText, 10, this.canvas.height - this.lineHeight);
    this.texture.needsUpdate = true;
  }

  enqueueLine(text) {
    this.lines.push(text);
    this.draw();
  }

  // --------------------------------------------
  // Help Command
  // --------------------------------------------
  help() {
    this.enqueueLine("Available commands:");
    this.enqueueLine("  order [ingredient]  - Place a new order (e.g. order beef)");
    this.enqueueLine("  list                - Show all incomplete orders");
    this.enqueueLine("  complete [number]   - Mark order as completed (e.g. complete 1)");
    this.enqueueLine("  help                - Show this help message");
    this.enqueueLine("  exit                - Exit the terminal");
  }

  // --------------------------------------------
  // Persistent Order Handling
  // --------------------------------------------
  initOrderManager() {
    this.orders = [];
    this.lastOrderNumber = 0;

    const raw = sessionStorage.getItem("orders");
    if (raw) {
      try {
        this.orders = JSON.parse(raw);
        this.lastOrderNumber =
          parseInt(sessionStorage.getItem("lastOrderNumber"), 10) || this.orders.length;
      } catch {
        this.orders = [];
        this.lastOrderNumber = 0;
      }
    }
  }

  saveOrderState() {
    sessionStorage.setItem("orders", JSON.stringify(this.orders));
    sessionStorage.setItem("lastOrderNumber", this.lastOrderNumber);
  }

  // --------------------------------------------
  // Create Random Meal Order
  // --------------------------------------------
  async createOrder(mainIngredientRaw) {
    const norm = mainIngredientRaw.toLowerCase().trim().replace(/\s+/g, "_");
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${norm}`;

    let resp;
    try {
      resp = await fetch(url);
    } catch {
      this.enqueueLine("Error fetching meals. Try again.");
      return;
    }

    const data = await resp.json();
    if (!data.meals) {
      this.enqueueLine(`No meals found for \"${mainIngredientRaw}\". Try another ingredient.`);
      return;
    }

    const choice = data.meals[Math.floor(Math.random() * data.meals.length)];
    const description = choice.strMeal;

    this.lastOrderNumber++;
    const order = {
      number: this.lastOrderNumber,
      description,
      completed: false,
    };
    this.orders.push(order);
    this.saveOrderState();
    this.enqueueLine(`Order #${order.number} created: ${order.description}`);
  }

  showIncompleteOrders() {
    const incomplete = this.orders.filter((o) => !o.completed);
    if (incomplete.length === 0) {
      this.enqueueLine("No incomplete orders.");
    } else {
      this.enqueueLine("Incomplete orders:");
      incomplete.forEach((o) => this.enqueueLine(`  #${o.number}: ${o.description}`));
    }
  }

  completeOrder(num) {
    const o = this.orders.find((o) => o.number === num);
    if (!o) return this.enqueueLine(`Order #${num} not found.`);
    if (o.completed) return this.enqueueLine(`Order #${num} is already completed.`);

    o.completed = true;
    this.saveOrderState();
    this.enqueueLine(`Order #${num} marked as completed.`);

    if (window.tvOverlay && o.description) {
      window.tvOverlay.displayText(`Order To Complete:\n${o.description}`);
    }

    this.canPlayWalkie = true;
    this.locked = true;
    this.enqueueLine("Terminal locked. Proceed to the kitchen.");

    setTimeout(() => {
      if (window.walkieTalkie?.static && !window.walkieTalkie.static.isPlaying) {
        window.walkieTalkie.static.play();
        showPrompt("I wonder where that strange sound is coming from?");
      }
    }, 1000);
  }

  // --------------------------------------------
  // Key Input Handler
  // --------------------------------------------
  handleKey(e) {
    if (currentView !== "computer" || !this.active || this.locked) return;

    const prompt = "user@pc:~$ ";

    if (e.key === "Backspace") {
      if (this.inputText.length > prompt.length) {
        this.inputText = this.inputText.slice(0, -1);
      }
    } else if (e.key === "Enter") {
      const cmd = this.inputText.slice(prompt.length).trim();
      this.enqueueLine(this.inputText);
      this.inputText = prompt;
      this.processCommand(cmd);
    } else if (e.key.length === 1) {
      this.inputText += e.key;
    }

    this.draw();
    this.playKeySound();
  }

  // --------------------------------------------
  // Command Parser
  // --------------------------------------------
  async processCommand(cmd) {
    const parts = cmd.split(/\s+/);
    const base = parts[0]?.toLowerCase();

    if (base === "order" && parts[1]) {
      await this.createOrder(parts.slice(1).join(" "));
    } else if (base === "list") {
      this.showIncompleteOrders();
    } else if (base === "complete") {
      const n = parseInt(parts[1], 10);
      if (!isNaN(n) && n > 0) {
        this.completeOrder(n);
      } else {
        this.enqueueLine("Usage: complete [orderNumber]");
      }
    } else if (base === "help") {
      this.help();
    } else if (base === "exit") {
      this.enqueueLine("Exiting terminal.");
      this.active = false;
    } else {
      this.enqueueLine(`Unknown command: \"${cmd}\". Type 'help' for commands.`);
    }
  }

  // --------------------------------------------
  // Play Random Keystroke Sound
  // --------------------------------------------
  playKeySound() {
    const available = this.keystrokeSounds.filter((s) => s.buffer !== undefined);
    if (available.length === 0) return;

    const sound = available[Math.floor(Math.random() * available.length)];
    if (sound.isPlaying) sound.stop();
    sound.play();
  }
}
