// --------------------------------------------
// Asset Loader Functions
// --------------------------------------------
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TerminalInterface } from "./TerminalInterface.js";
import { TVOverlay } from "./tvOverlay.js";
import { createPositionalAudio } from "./audio.js";

const loader = new GLTFLoader();

// --------------------------------------------
// Load Computer Scene
// --------------------------------------------
function loadComputerScene(scene, camera, transitionTo, onTerminalReady) {
  loader.load("assets/computer_scene.glb", (gltf) => {
    const model = gltf.scene;
    model.position.set(-7, -2.5, 0);

    const computerParts = [];
    const roomMeshes = [];

    model.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const name = child.name.toLowerCase();

      // 🖥️ Add PC components
      if (name.startsWith("pc")) {
        computerParts.push(child);
        roomMeshes.push(child);
      }

      // 🧱 Add room parts
      if (name.startsWith("computer_room")) {
        roomMeshes.push(child);
      }

      // 💻 Replace terminal screen material
      if (name === "pc_monitor_mp_1_screen_2") {
        const mat = child.material;
        let targetMat = null;

        if (mat.name === "crt_screen_mp_2") {
          targetMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: new THREE.Color(0x00ff00),
            emissiveIntensity: 1.5,
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.FrontSide,
          });
          child.material = targetMat;
        }

        if (targetMat) {
          const terminal = new TerminalInterface(
            targetMat,
            camera,
            transitionTo
          );
          onTerminalReady(terminal);
        }
      }
    });

    scene.add(model);
  });
}

// --------------------------------------------
// Load Kitchen Scene
// --------------------------------------------
function loadKitchenScene(scene, camera) {
  loader.load("assets/kitchen_scene.glb", (gltf) => {
    const model = gltf.scene;
    model.position.set(0, -2.5, -7);

    model.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.castShadow = true;
      child.receiveShadow = true;

      const name = child.name.toLowerCase();
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      // 📺 Replace TV screen material
      materials.forEach((mat, index) => {
        if (mat?.name === "tv_screen") {
          const targetMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: new THREE.Color(0x00ff00),
            emissiveIntensity: 1.5,
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.FrontSide,
          });

          if (Array.isArray(child.material)) {
            child.material[index] = targetMat;
          } else {
            child.material = targetMat;
          }

          const overlay = new TVOverlay(targetMat);
          window.tvOverlay = overlay;
        }
      });

      // 📻 Attach positional audio to walkie talkie
      if (name.includes("walkie_talkie")) {
        const listener = camera.children.find(
          (c) => c.type === "AudioListener"
        );
        if (!listener) return;

        // 📡 Create static noise sound (do NOT play immediately)
        const staticAudio = createPositionalAudio(
          "audio/radio_static.mp3",
          listener,
          {
            volume: 0.1,
            loop: true,
            distance: 5,
            autoplay: false, // ⛔ prevent autoplay
          }
        );

        // 🗣️ Create mumble message sound
        const mumbleAudio = createPositionalAudio(
          "audio/radio_mumble.mp3",
          listener,
          {
            volume: 0.2,
            loop: false,
            distance: 5,
            autoplay: false,
          }
        );

        // 🔈 Attach both to walkie talkie mesh
        child.add(staticAudio);
        child.add(mumbleAudio);

        // 🔒 Store globally for interaction
        window.walkieTalkie = {
          mesh: child,
          static: staticAudio,
          mumble: mumbleAudio,
          interacted: false,
        };
      }
    });

    scene.add(model);
  });
}

// --------------------------------------------
// Exports
// --------------------------------------------
export { loadComputerScene, loadKitchenScene };
