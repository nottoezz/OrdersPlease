// --------------------------------------------
// Walkie Talkie & Cooking Logic
// --------------------------------------------
import { radioPoems } from "./recipes.js";
import { pencilScribble, meatSplat, microwaveSuccess, microwaveFailure } from "./audio.js";
import { animateMicrowave } from "./animations.js";
import { showPrompt } from "./utility.js";

// --------------------------------------------
// Handle Walkie Talkie Interaction
// --------------------------------------------
export function handleWalkieInteraction() {
  const wt = window.walkieTalkie;
  const poemOverlay = document.getElementById("poem-overlay");
  const poemTextEl = poemOverlay?.querySelector(".poem-text");

  // Stop radio static
  if (wt?.static?.isPlaying) wt.static.stop();

  // Play mumble audio
  if (wt?.mumble) wt.mumble.play();

  // Pick a random poem
  const poem = radioPoems[Math.floor(Math.random() * radioPoems.length)];
  window.currentRecipe = { flesh: poem.flesh, steps: poem.steps };

  // Display clue with typing animation
  if (poemOverlay && poemTextEl) {
    poemTextEl.textContent = "";
    poemOverlay.classList.remove("hidden");

    setTimeout(() => {
      pencilScribble.play();
      let i = 0;
      const interval = setInterval(() => {
        poemTextEl.textContent += poem.clue[i++];
        if (i >= poem.clue.length) clearInterval(interval);
      }, 30);
    }, 1000);
  }
}

// --------------------------------------------
// Move Flesh Mesh to Bowl Position
// --------------------------------------------
export function moveFleshToBowl(fleshMesh, scene) {
  console.log("Moving flesh to bowl:", fleshMesh.name);

  // Remove old flesh
  if (window.spawnedFlesh && scene.children.includes(window.spawnedFlesh)) {
    scene.remove(window.spawnedFlesh);
  }

  meatSplat.play();

  // Clone & transform flesh
  const clone = fleshMesh.clone();
  clone.position.set(-1.75, -1.5, -8.7);
  clone.rotation.set(0, 0, 0);
  clone.scale.set(
    fleshMesh.name.toLowerCase().includes("flesh02") ? 0.015 : 0.2,
    fleshMesh.name.toLowerCase().includes("flesh02") ? 0.015 : 0.2,
    fleshMesh.name.toLowerCase().includes("flesh02") ? 0.015 : 0.2
  );

  scene.add(clone);
  window.spawnedFlesh = clone;
}

// --------------------------------------------
// Track Used Tools
// --------------------------------------------
export let usedTools = [];
export function handleToolUse(toolName) {
  if (usedTools.length < 3) {
    usedTools.push(toolName);
    console.log("Used tools:", usedTools);
  }
}

// --------------------------------------------
// Cook Flesh in Microwave & Evaluate Recipe
// --------------------------------------------
export function cookFlesh(scene) {
  if (!window.spawnedFlesh || !window.currentRecipe) {
    console.warn("Nothing to cook or no active recipe.");
    return;
  }

  const bowl = window.spawnedFlesh;
  const microwave = scene.getObjectByName("microwave_2");
  if (!microwave) {
    console.warn("Microwave not found in scene.");
    return;
  }

  animateMicrowave(scene, () => {
    const expectedFlesh = window.currentRecipe.flesh.toLowerCase();
    const expectedTools = window.currentRecipe.steps.map((t) => t.toLowerCase());

    const usedFlesh = bowl.name.toLowerCase();
    const toolsCorrect = arraysEqualIgnoreOrder(expectedTools, usedTools);
    const fleshCorrect = usedFlesh.includes(expectedFlesh);

    const success = fleshCorrect && toolsCorrect;

    console.log("Expected flesh:", expectedFlesh);
    console.log("Expected tools:", expectedTools);
    console.log("Chosen flesh:", usedFlesh);
    console.log("Chosen tools:", usedTools);

    if (success) {
      microwaveSuccess.play();
      console.log("✅ Meal cooked successfully!");
      showPrompt("Well done, you may return to the terminal")
    } else {
      microwaveFailure.play();
      console.log("💥 Meal failed!");
      showPrompt("Oh now... order failed, you way return to the terminal")
    }

    // Cleanup
    usedTools = [];
    scene.remove(bowl);
    window.spawnedFlesh = null;
    window.currentRecipe = null;

    if (window.terminal) {
      window.terminal.canPlayWalkie = true;
    }
  });
}

// --------------------------------------------
// Helper - Compare Arrays Without Order
// --------------------------------------------
function arraysEqualIgnoreOrder(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}
