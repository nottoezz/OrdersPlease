// ------------------------------------------------------
// Animation Functions for Kitchen Interactions
// ------------------------------------------------------
import * as THREE from "three";
import { knifeCut, syringeInject, spoonStir, crossShake } from "./audio.js";

// ------------------------------------------------------
// Knife Animation - chops down, pauses, lifts, then resets
// ------------------------------------------------------
export function animateKnife(scene) {
  if (window.isAnimating) return;
  window.isAnimating = true;

  const knife = scene.getObjectByName("knife");
  if (!knife) {
    window.isAnimating = false;
    return;
  }

  const originalPos = knife.position.clone();
  const originalRot = knife.rotation.clone();

  const bowlPos = new THREE.Vector3(-1.8, 1.4, -1.7);
  const bowlRot = new THREE.Euler(0, 0, 1.5);

  const moveDuration = 1000;
  const swingAmplitude = 0.35;
  const chopDownFrames = 10;
  const pauseFrames = 40;
  const liftUpFrames = 40;

  let startTime = null;

  function moveToBowl(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const t = Math.min(elapsed / moveDuration, 1);

    knife.position.copy(originalPos.clone().lerp(bowlPos, t));
    knife.rotation.x = THREE.MathUtils.lerp(originalRot.x, bowlRot.x, t);
    knife.rotation.y = THREE.MathUtils.lerp(originalRot.y, bowlRot.y, t);
    knife.rotation.z = THREE.MathUtils.lerp(originalRot.z, bowlRot.z, t);

    if (t < 1) {
      requestAnimationFrame(moveToBowl);
    } else {
      animateCut();
    }
  }

  let frame = 0;
  function animateCut() {
    frame++;
    if (frame === 1) knifeCut.play();

    if (frame <= chopDownFrames) {
      const t = frame / chopDownFrames;
      knife.position.y = THREE.MathUtils.lerp(
        bowlPos.y,
        bowlPos.y - swingAmplitude,
        t
      );
    } else if (frame <= chopDownFrames + pauseFrames) {
      knife.position.y = bowlPos.y - swingAmplitude;
    } else if (frame <= chopDownFrames + pauseFrames + liftUpFrames) {
      const t = (frame - chopDownFrames - pauseFrames) / liftUpFrames;
      knife.position.y = THREE.MathUtils.lerp(
        bowlPos.y - swingAmplitude,
        bowlPos.y,
        t
      );
    } else {
      returnToOriginal();
      return;
    }

    requestAnimationFrame(animateCut);
  }

  function returnToOriginal() {
    let returnStart = null;
    const returnDuration = 800;

    function animateReturn(time) {
      if (!returnStart) returnStart = time;
      const elapsed = time - returnStart;
      const t = Math.min(elapsed / returnDuration, 1);

      knife.position.copy(bowlPos.clone().lerp(originalPos, t));
      knife.rotation.x = THREE.MathUtils.lerp(bowlRot.x, originalRot.x, t);
      knife.rotation.y = THREE.MathUtils.lerp(bowlRot.y, originalRot.y, t);
      knife.rotation.z = THREE.MathUtils.lerp(bowlRot.z, originalRot.z, t);

      if (t < 1) {
        requestAnimationFrame(animateReturn);
      } else {
        window.isAnimating = false;
      }
    }

    requestAnimationFrame(animateReturn);
  }

  requestAnimationFrame(moveToBowl);
}

// ------------------------------------------------------
// Syringe Animation - dips into bowl and lifts back
// ------------------------------------------------------
export function animateSyringe(scene) {
  if (window.isAnimating) return;
  window.isAnimating = true;

  const syringe = scene.getObjectByName("syringe");
  if (!syringe) {
    window.isAnimating = false;
    return;
  }

  const originalPos = syringe.position.clone();
  const originalRot = syringe.rotation.clone();

  const bowlPos = new THREE.Vector3(-1.7, 1.5, -1.7);
  const bowlRot = new THREE.Euler(0.2, 0, -0.4);

  const moveDuration = 1000;
  const dipAmplitude = 0.35;
  const injectDownFrames = 20;
  const pauseFrames = 200;
  const liftUpFrames = 40;

  let startTime = null;

  function moveToBowl(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const t = Math.min(elapsed / moveDuration, 1);

    syringe.position.copy(originalPos.clone().lerp(bowlPos, t));
    syringe.rotation.x = THREE.MathUtils.lerp(originalRot.x, bowlRot.x, t);
    syringe.rotation.y = THREE.MathUtils.lerp(originalRot.y, bowlRot.y, t);
    syringe.rotation.z = THREE.MathUtils.lerp(originalRot.z, bowlRot.z, t);

    if (t < 1) {
      requestAnimationFrame(moveToBowl);
    } else {
      animateInject();
    }
  }

  let frame = 0;
  function animateInject() {
    frame++;
    if (frame === 1) syringeInject.play();

    if (frame <= injectDownFrames) {
      const t = frame / injectDownFrames;
      syringe.position.y = THREE.MathUtils.lerp(
        bowlPos.y,
        bowlPos.y - dipAmplitude,
        t
      );
    } else if (frame <= injectDownFrames + pauseFrames) {
      syringe.position.y = bowlPos.y - dipAmplitude;
    } else if (frame <= injectDownFrames + pauseFrames + liftUpFrames) {
      const t = (frame - injectDownFrames - pauseFrames) / liftUpFrames;
      syringe.position.y = THREE.MathUtils.lerp(
        bowlPos.y - dipAmplitude,
        bowlPos.y,
        t
      );
    } else {
      returnToOriginal();
      return;
    }

    requestAnimationFrame(animateInject);
  }

  function returnToOriginal() {
    let returnStart = null;
    const returnDuration = 800;

    function animateReturn(time) {
      if (!returnStart) returnStart = time;
      const elapsed = time - returnStart;
      const t = Math.min(elapsed / returnDuration, 1);

      syringe.position.copy(bowlPos.clone().lerp(originalPos, t));
      syringe.rotation.x = THREE.MathUtils.lerp(bowlRot.x, originalRot.x, t);
      syringe.rotation.y = THREE.MathUtils.lerp(bowlRot.y, originalRot.y, t);
      syringe.rotation.z = THREE.MathUtils.lerp(bowlRot.z, originalRot.z, t);

      if (t < 1) {
        requestAnimationFrame(animateReturn);
      } else {
        window.isAnimating = false;
      }
    }

    requestAnimationFrame(animateReturn);
  }

  requestAnimationFrame(moveToBowl);
}

// ------------------------------------------------------
// Spoon Animation - drops, stirs in circular motion, resets
// ------------------------------------------------------
export function animateSpoon(scene) {
  if (window.isAnimating) return;
  window.isAnimating = true;

  const spoon = scene.getObjectByName("spoon");
  if (!spoon) {
    window.isAnimating = false;
    return;
  }

  const originalPos = spoon.position.clone();
  const originalRot = spoon.rotation.clone();

  const bowlPos = new THREE.Vector3(-1.7, 1.5, -1.7);
  const bowlRot = new THREE.Euler(-1, 0.6, 1);
  const center = bowlPos.clone();

  const moveDuration = 1000;
  const dropAmount = 0.4;
  const dropFrames = 40;
  const totalStirFrames = 100;
  const stirSpeed = 0.1;
  const stirRadius = 0.1;

  let stirFrame = 0;
  let startTime = null;

  function moveToBowl(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const t = Math.min(elapsed / moveDuration, 1);

    spoon.position.copy(originalPos.clone().lerp(bowlPos, t));
    spoon.rotation.x = THREE.MathUtils.lerp(originalRot.x, bowlRot.x, t);
    spoon.rotation.y = THREE.MathUtils.lerp(originalRot.y, bowlRot.y, t);
    spoon.rotation.z = THREE.MathUtils.lerp(originalRot.z, bowlRot.z, t);

    if (t < 1) {
      requestAnimationFrame(moveToBowl);
    } else {
      animateDrop();
    }
  }

  let dropFrame = 0;
  function animateDrop() {
    dropFrame++;
    const t = dropFrame / dropFrames;
    spoon.position.y = THREE.MathUtils.lerp(
      bowlPos.y,
      bowlPos.y - dropAmount,
      t
    );

    if (dropFrame < dropFrames) {
      requestAnimationFrame(animateDrop);
    } else {
      animateStir();
    }
  }

  spoonStir.play();
  function animateStir() {
    stirFrame++;

    const angle = stirFrame * stirSpeed;
    spoon.position.x = center.x + Math.cos(angle) * stirRadius;
    spoon.position.z = center.z + Math.sin(angle) * stirRadius;

    if (stirFrame < totalStirFrames) {
      requestAnimationFrame(animateStir);
    } else {
      returnToOriginal();
    }
  }

  function returnToOriginal() {
    let returnStart = null;
    const returnDuration = 800;

    function animateReturn(time) {
      if (!returnStart) returnStart = time;
      const elapsed = time - returnStart;
      const t = Math.min(elapsed / returnDuration, 1);

      spoon.position.copy(center.clone().lerp(originalPos, t));
      spoon.rotation.x = THREE.MathUtils.lerp(bowlRot.x, originalRot.x, t);
      spoon.rotation.y = THREE.MathUtils.lerp(bowlRot.y, originalRot.y, t);
      spoon.rotation.z = THREE.MathUtils.lerp(bowlRot.z, originalRot.z, t);

      if (t < 1) {
        requestAnimationFrame(animateReturn);
      } else {
        window.isAnimating = false;
      }
    }

    requestAnimationFrame(animateReturn);
  }

  requestAnimationFrame(moveToBowl);
}

// ------------------------------------------------------
// Cross Animation - rises, shakes, and returns
// ------------------------------------------------------
export function animateCross(scene) {
  if (window.isAnimating) return;
  window.isAnimating = true;

  const cross = scene.getObjectByName("cross");
  if (!cross) {
    window.isAnimating = false;
    return;
  }

  const originalPos = cross.position.clone();
  const originalRot = cross.rotation.clone();

  const bowlCenter = new THREE.Vector3(-1.75, 1, -1.7);
  const hoverHeight = 0.5;
  const riseDuration = 1000;
  const shakeDuration = 1500;

  let startTime = null;

  function riseUp(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const t = Math.min(elapsed / riseDuration, 1);

    const targetPos = bowlCenter
      .clone()
      .add(new THREE.Vector3(0, hoverHeight, 0));
    cross.position.copy(originalPos.clone().lerp(targetPos, t));
    cross.rotation.x = THREE.MathUtils.lerp(originalRot.x, 0, t);
    cross.rotation.y = THREE.MathUtils.lerp(originalRot.y, 0, t);
    cross.rotation.z = THREE.MathUtils.lerp(originalRot.z, 0, t);

    if (t < 1) {
      requestAnimationFrame(riseUp);
    } else {
      requestAnimationFrame(shakeCross);
    }
  }

  let shakeStart = null;
  crossShake.play()
  function shakeCross(time) {
    if (!shakeStart) shakeStart = time;
    const elapsed = time - shakeStart;
    const t = elapsed / shakeDuration;

    const shakeStrength = 0.01;
    cross.rotation.x = Math.sin(t * 80) * shakeStrength;
    cross.rotation.y = Math.sin(t * 100) * shakeStrength;
    cross.rotation.z = Math.sin(t * 90) * shakeStrength;

    if (elapsed < shakeDuration) {
      requestAnimationFrame(shakeCross);
    } else {
      returnToOriginal();
    }
  }

  function returnToOriginal() {
    let returnStart = null;
    const returnDuration = 800;

    function animateReturn(time) {
      if (!returnStart) returnStart = time;
      const elapsed = time - returnStart;
      const t = Math.min(elapsed / returnDuration, 1);

      cross.position.copy(
        bowlCenter
          .clone()
          .add(new THREE.Vector3(0, hoverHeight, 0))
          .lerp(originalPos, t)
      );
      cross.rotation.x = THREE.MathUtils.lerp(0, originalRot.x, t);
      cross.rotation.y = THREE.MathUtils.lerp(0, originalRot.y, t);
      cross.rotation.z = THREE.MathUtils.lerp(0, originalRot.z, t);

      if (t < 1) {
        requestAnimationFrame(animateReturn);
      } else {
        window.isAnimating = false;
      }
    }

    requestAnimationFrame(animateReturn);
  }

  requestAnimationFrame(riseUp);
}

// ------------------------------------------------------
// Microwave Animation - door closes, flickers, completes
// ------------------------------------------------------
export function animateMicrowave(scene, onComplete) {
  const microwave = scene.getObjectByName("microwave_2");
  if (!microwave) {
    if (onComplete) onComplete();
    return;
  }

  window.isAnimating = true;

  const door = microwave.children.find(c => c.name.toLowerCase().includes("door"));
  let frame = 0;
  const openFrames = 20;

  function closeDoor() {
    frame++;
    if (door) {
      door.rotation.y = THREE.MathUtils.lerp(0, -Math.PI / 2, frame / openFrames);
    }

    if (frame < openFrames) {
      requestAnimationFrame(closeDoor);
    } else {
      simulateCooking();
    }
  }

  function simulateCooking() {
    let flickerFrame = 0;
    const totalCookFrames = 100;

    function flicker() {
      flickerFrame++;
      if (flickerFrame % 10 < 5) microwave.material.emissiveIntensity = 1;
      else microwave.material.emissiveIntensity = 0.1;

      if (flickerFrame < totalCookFrames) {
        requestAnimationFrame(flicker);
      } else {
        window.isAnimating = false;
        if (onComplete) onComplete();
      }
    }

    flicker();
  }

  closeDoor();
}

