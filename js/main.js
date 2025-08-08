// --------------------------------------------
// Imports
// --------------------------------------------
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

import { playIntroSequence } from "./introSequence.js";
import { loadComputerScene, loadKitchenScene } from "./assetLoader.js";
import {
  flickerLight,
  setupHighlightOnHover,
  showFleshName,
} from "./utility.js";
import { highlightSettings } from "./highlightConfig.js";
import { setupMenuOverlay } from "./menuOverlay.js";

import {
  initAudio,
  ambientSound,
  lightStartupSound,
  lightLoopSound,
  lightOffSound,
} from "./audio.js";

import {
  handleWalkieInteraction,
  moveFleshToBowl,
  handleToolUse,
  cookFlesh,
} from "./gameLoop.js";

import {
  animateKnife,
  animateSyringe,
  animateSpoon,
  animateCross,
} from "./animations.js";

// --------------------------------------------
// Global State Variables
// --------------------------------------------
let transitionInProgress = false;
let pendingTerminalActivation = false;
let terminal = null;
let poemReceived = false;
let fleshChosen = false;
let mealPrepared = false;
window.isAnimating = false;
export let currentView = "wide";
export let isMenuOpen = false;

// --------------------------------------------
// Scene Setup
// --------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const ambientLight = new THREE.AmbientLight(0xcd9495, 0.01);
scene.add(ambientLight);

// --------------------------------------------
// Camera Setup
// --------------------------------------------
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
scene.add(camera);

// --------------------------------------------
// Audio Setup
// --------------------------------------------
initAudio(camera);

// --------------------------------------------
// Camera Views
// --------------------------------------------
export const cameraViews = {
  wide: { position: new THREE.Vector3(5, 2, 5), lookAt: new THREE.Vector3(0, 0, 0) },
  computerRoom: { position: new THREE.Vector3(-4, -0.75, 3), lookAt: new THREE.Vector3(-9, -1, -2) },
  computer: { position: new THREE.Vector3(-8.2, -1.2, -1.5), lookAt: new THREE.Vector3(-11, -2, -5) },
  kitchenRoom: { position: new THREE.Vector3(3, -0.75, -4), lookAt: new THREE.Vector3(-2, -1, -9) },
  tableView: { position: new THREE.Vector3(-1.5, -0.5, -7.75), lookAt: new THREE.Vector3(-2.1, -3, -10.1) },
  fridgeView: { position: new THREE.Vector3(-1.5, -1, -9), lookAt: new THREE.Vector3(-5, -2, -9) },
  microwaveView: { position: new THREE.Vector3(-0.7, -1, -9), lookAt: new THREE.Vector3(-0.6, -1.25, -10.15) },
  tvView: { position: new THREE.Vector3(-2.5, -0.5, -9.5), lookAt: new THREE.Vector3(-4, 0.1, -11) },
  crateView: { position: new THREE.Vector3(-2.5, -1, -7.5), lookAt: new THREE.Vector3(-4, -3, -8.5) },
};

let viewHistory = ["wide"];
camera.position.copy(cameraViews.wide.position);
camera.lookAt(cameraViews.wide.lookAt);

// --------------------------------------------
// Renderer
// --------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --------------------------------------------
// Post-Processing
// --------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// --------------------------------------------
// Resize Handling
// --------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --------------------------------------------
// Orbit Controls (disabled in gameplay)
// --------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = false;

// --------------------------------------------
// Start Intro & Menu Overlay
// --------------------------------------------
playIntroSequence(() => {
  setupMenuOverlay(() => {
    setTimeout(() => transitionTo("computerRoom"), 100);
    if (!ambientSound.isPlaying) ambientSound.play();
  }, renderer, ambientSound);
});

// --------------------------------------------
// Lights Setup
// --------------------------------------------
// Computer room ceiling light
const ceilingLight = new THREE.PointLight(0xe98d31, 10, 4, 1);
ceilingLight.position.set(-9, 0.35, -2);
scene.add(ceilingLight);

// Computer room spotlight
const spotLight = new THREE.SpotLight(0xfff5cc, 3, 5, Math.PI / 8, 0.3, 1);
spotLight.position.set(-10.4, -1.1, -0.5);
spotLight.target.position.set(-5, -1.1, -6);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(128, 128);
spotLight.shadow.bias = -0.0005;
scene.add(spotLight);
scene.add(spotLight.target);

// Kitchen room fridge light
const kitchenFridgeLight = new THREE.PointLight(0xecab86, 1, 15, 20);
kitchenFridgeLight.position.set(-3.5, -1.1, -9);
scene.add(kitchenFridgeLight);

// Kitchen room oven light
const kitchenOvenLight = new THREE.PointLight(0xecab86, 1, 15, 20);
kitchenOvenLight.position.set(-0.5, -1.2, -10.5);
scene.add(kitchenOvenLight);

// Kitchen figure light (TO BE PROPERLY IMPLEMENTED)
const kitchenFigureLight = new THREE.PointLight(0x331110, 1, 5, 9);
kitchenFigureLight.position.set(-2, -1.2, -10);
scene.add(kitchenFigureLight);

// kitchen table light
const tableLight = new THREE.SpotLight(0xffffff, 0, 5, Math.PI / 12, 0.3, 2);
tableLight.position.set(-1.75, 0.9, -8.7);
tableLight.target.position.set(-1.75, -1, -8.7);
tableLight.castShadow = true;
tableLight.shadow.mapSize.set(12, 12);
scene.add(tableLight);
scene.add(tableLight.target);

// --------------------------------------------
// Raycaster Init
// --------------------------------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --------------------------------------------
// Load Assets
// --------------------------------------------
loadComputerScene(scene, camera, transitionTo, (loadedTerminal) => {
  terminal = loadedTerminal;
});

loadKitchenScene(scene, camera);

// --------------------------------------------
// Mouse Interaction
// --------------------------------------------
window.addEventListener("click", (event) => {
  if (transitionInProgress) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  if (!hits.length) return;

  const hit = hits[0].object;
  const name = hit.name.toLowerCase();

  const inComputerRoom = name.startsWith("computer_room");
  const inKitchenRoom = name.startsWith("kitchen");

  // debug what was clicked on
  console.log(name);

  if (currentView === "wide") {
    if (inComputerRoom) transitionTo("computerRoom");
    else if (inKitchenRoom) transitionTo("kitchenRoom");
  } else if (currentView === "computerRoom" && name.startsWith("pc")) {
    pendingTerminalActivation = true;
    transitionTo("computer");
  } else if (currentView === "kitchenRoom") {
    if (name.startsWith("fridge")) transitionTo("fridgeView");
    else if (name.startsWith("table")) transitionTo("tableView");
    else if (name.startsWith("microwave")) transitionTo("microwaveView");
    else if (name.startsWith("tv")) transitionTo("tvView");
    else if (name.startsWith("wooden_crate")) transitionTo("crateView");

    // Crate View
  } else if (currentView == "crateView") {
    if (name.startsWith("walkie_talkie") && terminal?.canPlayWalkie) {
      handleWalkieInteraction();
      poemReceived = true;
      terminal.canPlayWalkie = false;
    } else if (name.startsWith("book")) {
      const poemOverlay = document.getElementById("poem-overlay");
      if (poemOverlay) poemOverlay.classList.remove("hidden");
    }

    // Fridge View
  } else if (currentView === "fridgeView") {
    showFleshName(name);
    if (name.startsWith("flesh") && poemReceived) {
      console.log("Calling moveFleshToBowl with", name);
      moveFleshToBowl(hit, scene);
      fleshChosen = true;
    }

    // Table view
  } else if (currentView === "tableView" && fleshChosen) {
    if (name === "knife") {
      mealPrepared = true;
      handleToolUse("knife");
      animateKnife(scene);
    } else if (name == "syringe") {
      mealPrepared = true;
      handleToolUse("syringe");
      animateSyringe(scene);
    } else if (name === "spoon") {
      mealPrepared = true;
      handleToolUse("spoon");
      animateSpoon(scene);
    } else if (name == "cross") {
      mealPrepared = true;
      handleToolUse("cross");
      animateCross(scene);
    }
  } else if (currentView === "microwaveView" && mealPrepared) {
    if (name.startsWith("microwave")) {
      cookFlesh(scene);
      terminal.locked = false;
      mealPrepared = false;
      fleshChosen = false;
      poemReceived = false;
    }
  }
});

// --------------------------------------------
// Right-click View Return
// --------------------------------------------
window.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  if (transitionInProgress) return;
  if (viewHistory.length > 1) {
    viewHistory.pop();
    transitionTo(viewHistory[viewHistory.length - 1], false);
  }
});

// --------------------------------------------
// Highlight objects on hover
// --------------------------------------------
highlightSettings.forEach(({ view, objectNames, highlightColor }) => {
  setupHighlightOnHover({
    camera,
    scene,
    raycaster,
    mouse,
    getCurrentView: () => currentView,
    targetView: view,
    objectNames,
    highlightColor,
  });
});

// --------------------------------------------
// Transition Camera View
// --------------------------------------------
function transitionTo(view, push = true) {
  if (transitionInProgress) return;
  const v = cameraViews[view];
  if (!v || view === currentView) return;

  transitionInProgress = true;

  if (currentView === "tableView" && view !== "tableView") {
    lightOffSound.play();
    tableLight.intensity = 0;
    if (lightLoopSound.isPlaying) lightLoopSound.stop();
    if (lightStartupSound.isPlaying) lightStartupSound.stop();
  }

  if (push) viewHistory.push(view);

  const startPos = camera.position.clone();
  const endPos = v.position.clone();
  const startTarget = new THREE.Vector3();
  camera.getWorldDirection(startTarget);
  startTarget.add(camera.position);
  const endTarget = v.lookAt.clone();

  let startTime = null;

  function move(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(elapsed / 1000, 1);

    camera.position.lerpVectors(startPos, endPos, t);
    const lookAt = startTarget.clone().lerp(endTarget, t);
    camera.lookAt(lookAt);

    if (t < 1) {
      requestAnimationFrame(move);
    } else {
      setCurrentView(view);
      transitionInProgress = false;

      if (view === "tableView") {
        flickerLight(tableLight, lightStartupSound, lightLoopSound, 2, 8, 80);
      }

      if (pendingTerminalActivation) {
        if (terminal) {
          console.log("Activating terminal...");
          terminal.activate();
        } else {
          console.warn("Terminal not yet loaded, cannot activate.");
        }
        pendingTerminalActivation = false;
      }
    }
  }

  requestAnimationFrame(move);
}

// --------------------------------------------
// Menu Open Toggle
// --------------------------------------------
export function setMenuOpen(state) {
  isMenuOpen = state;
}

// --------------------------------------------
// Ambient Light Slider Handling
// --------------------------------------------
document.getElementById("ambient-slider").addEventListener("input", (e) => {
  const value = parseFloat(e.target.value);
  ambientLight.intensity = value;
});

// --------------------------------------------
// Hide Poem Overlay on Enter or Escape
// --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("close-poem")?.addEventListener("click", () => {
    document.getElementById("poem-overlay")?.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      document.getElementById("poem-overlay")?.classList.add("hidden");
    }
  });
});

// --------------------------------------------
// Update View Tracker
// --------------------------------------------
export function setCurrentView(view) {
  currentView = view;
}

// --------------------------------------------
// Animation Loop
// --------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  ceilingLight.intensity = 0.6 + Math.random() * 0.2;
  kitchenFigureLight.intensity = 9.5 + Math.random() * 0.1;
  composer.render();
}
animate();
