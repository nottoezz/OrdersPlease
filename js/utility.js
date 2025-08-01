import * as THREE from "three";

// --------------------------------------------
// Kitchen Light Flicker Effect
// --------------------------------------------
let currentFlicker = null;

export function flickerLight(
  light,
  startupSound,
  loopSound,
  intensity = 2,
  flickers = 8,
  interval = 80
) {
  // Cancel any existing flicker
  if (currentFlicker) clearInterval(currentFlicker);

  // Stop looping and startup sounds
  if (loopSound.isPlaying) loopSound.stop();
  if (startupSound.isPlaying) startupSound.stop();

  // Start flicker sound and flicker logic
  startupSound.play();
  light.intensity = 0;
  let flickerCount = 0;

  currentFlicker = setInterval(() => {
    light.intensity = Math.random() > 0.5 ? intensity : 0;
    flickerCount++;

    // End flicker and begin loop sound
    if (flickerCount >= flickers) {
      clearInterval(currentFlicker);
      currentFlicker = null;
      light.intensity = intensity;
      if (startupSound.isPlaying) startupSound.stop();
      loopSound.play();
    }
  }, interval);
}

// --------------------------------------------
// Cancel Any Active Flicker
// --------------------------------------------
export function cancelFlicker() {
  if (currentFlicker) {
    clearInterval(currentFlicker);
    currentFlicker = null;
  }
}

// --------------------------------------------
// Highlight Objects on Hover
// --------------------------------------------
export function setupHighlightOnHover({
  camera,
  scene,
  raycaster,
  mouse,
  getCurrentView,
  targetView,
  objectNames,
  highlightColor = 0xffff00,
}) {
  let currentlyHighlighted = null;
  const originalMaterials = new Map();

  window.addEventListener("mousemove", (event) => {
    if (typeof window.isAnimating !== "undefined" && window.isAnimating) return;

    // Only respond if in the target view
    if (getCurrentView() !== targetView) {
      if (currentlyHighlighted) removeHighlight(currentlyHighlighted);
      return;
    }

    // Convert mouse coords to NDC
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    if (!hits.length) {
      if (currentlyHighlighted) removeHighlight(currentlyHighlighted);
      return;
    }

    const hit = hits[0].object;
    const name = hit.name.toLowerCase();

    const matches = objectNames.some((prefix) =>
      name.startsWith(prefix.toLowerCase())
    );

    if (matches) {
      if (currentlyHighlighted !== hit) {
        if (currentlyHighlighted) removeHighlight(currentlyHighlighted);
        applyHighlight(hit);
        currentlyHighlighted = hit;
      }
    } else if (currentlyHighlighted) {
      removeHighlight(currentlyHighlighted);
    }
  });

  // Apply emissive highlight to object
  function applyHighlight(object) {
    if (!originalMaterials.has(object)) {
      originalMaterials.set(object, object.material.clone());
    }

    object.material = object.material.clone();
    object.material.emissive = new THREE.Color(highlightColor);
    object.material.emissiveIntensity = 0.05;
  }

  // Revert highlight to original material
  function removeHighlight(object) {
    const original = originalMaterials.get(object);
    if (original) {
      object.material.dispose();
      object.material = original;
    }
    currentlyHighlighted = null;
  }
}

// --------------------------------------------
// Tutorial Prompt Display
// --------------------------------------------
export function showPrompt(text, duration = 5000) {
  const prompt = document.getElementById("tutorial-prompt");
  if (!prompt) return;

  prompt.textContent = text;
  prompt.classList.add("show", "visible");
  prompt.classList.remove("hidden");

  setTimeout(() => {
    prompt.classList.remove("show");
    setTimeout(() => prompt.classList.add("hidden"), 500);
  }, duration);
}

// --------------------------------------------
// Flesh Type Identifier Prompt
// --------------------------------------------
export function showFleshName(flesh) {
  if (flesh === "flesh00") showPrompt("Raw Meat", 1000);
  else if (flesh === "flesh01") showPrompt("Burnt Meat", 1000);
  else if (flesh === "flesh02") showPrompt("Rotten Meat", 1000);
}
