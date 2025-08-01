// --------------------------------------------
// Audio Initialization Module
// --------------------------------------------

import * as THREE from "three";

// --------------------------------------------
// Create a shared AudioListener
// --------------------------------------------
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

// --------------------------------------------
// Define core audio assets
// --------------------------------------------
const ambientSound = new THREE.Audio(listener);
const lightStartupSound = new THREE.Audio(listener);
const lightLoopSound = new THREE.Audio(listener);
const lightOffSound = new THREE.Audio(listener);
const radioStaticSound = new THREE.Audio(listener);
const radioMumbleSound = new THREE.Audio(listener);
const pencilScribble = new THREE.Audio(listener)
const meatSplat = new THREE.Audio(listener);
const knifeCut = new THREE.Audio(listener);
const syringeInject = new THREE.Audio(listener);
const spoonStir = new THREE.Audio(listener);
const crossShake = new THREE.Audio(listener);
const microwaveSuccess = new THREE.Audio(listener);
const microwaveFailure = new THREE.Audio(listener);

// --------------------------------------------
// Utility: Load and configure sound
// --------------------------------------------
function loadSound(sound, path, { loop = false, volume = 0.5 } = {}) {
  audioLoader.load(
    path,
    (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(loop);
      sound.setVolume(volume);
    }
  );
}

// --------------------------------------------
// Init audio for camera and load all clips
// --------------------------------------------
function initAudio(camera) {
  camera.add(listener);

  loadSound(ambientSound, "audio/ambient.mp3", { loop: true, volume: 0.5 });
  loadSound(lightStartupSound, "audio/kitchen_light/florescent_startup.mp3", { volume: 0.3 });
  loadSound(lightLoopSound, "audio/kitchen_light/florescent_loop.mp3", { loop: true, volume: 0.3 });
  loadSound(lightOffSound, "audio/kitchen_light/florescent_turn_off.mp3", { volume: 0.3 });
  loadSound(radioStaticSound, "audio/radio_static.mp3", { volume: 0.1 });
  loadSound(radioMumbleSound, "audio/radio_mumble.mp3", { volume: 0.2 });
  loadSound(pencilScribble, "audio/pencil_scribble.mp3", { volume: 0.4});
  loadSound(meatSplat, "audio/meat_splat.mp3", { volume: 0.3});
  loadSound(knifeCut, "audio/knife_cut.mp3", { volume: 0.4});
  loadSound(syringeInject, "audio/syringe.mp3", {volume: 0.3});
  loadSound(spoonStir, "audio/spoon.mp3", {volume: 0.4});
  loadSound(crossShake, "audio/cross.mp3", {volume: 1});
  loadSound(microwaveSuccess, "audio/microwave_success.mp3", {volume: 0.5});
  loadSound(microwaveFailure, "audio/microwave_failure.mp3", { volume: 1});
}

// --------------------------------------------
// Export all audio-related interfaces
// --------------------------------------------
export {
  initAudio,
  ambientSound,
  lightStartupSound,
  lightLoopSound,
  lightOffSound,
  radioStaticSound,
  radioMumbleSound,
  pencilScribble,
  meatSplat,
  knifeCut,
  syringeInject,
  spoonStir,
  crossShake,
  microwaveSuccess,
  microwaveFailure,

};

// --------------------------------------------
// Export positional audio creation utility
// --------------------------------------------
export function createPositionalAudio(path, listener, options = {}) {
  const sound = new THREE.PositionalAudio(listener);

  const loader = new THREE.AudioLoader();
  loader.load(path, (buffer) => {
    sound.setBuffer(buffer);

    // 🟢 Set positional + looping options after buffer is set
    sound.setLoop(options.loop ?? false);
    sound.setVolume(options.volume ?? 1);
    sound.setRefDistance(options.distance ?? 10);
    sound.setMaxDistance(options.maxDistance ?? 20);
    sound.setRolloffFactor(options.rolloff ?? 1);

    // 🔁 Start playback if requested
    if (options.autoplay) {
      sound.play();
    }
  });

  return sound;
}