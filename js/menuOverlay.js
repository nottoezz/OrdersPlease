import { setMenuOpen } from "./main.js";

export function setupMenuOverlay(startGameCallback, ambientLight) {
  const mainMenu = document.getElementById("main-menu");
  const settingsMenu = document.getElementById("settings-menu");
  const creditsMenu = document.getElementById("credits-menu");
  const controlsMenu = document.getElementById("controls-menu");

  const allMenus = [mainMenu, settingsMenu, creditsMenu, controlsMenu];

  const show = (menuToShow) => {
    allMenus.forEach((menu) => menu.classList.add("hidden"));
    menuToShow.classList.remove("hidden");
  };

  document.getElementById("close-menu-btn").addEventListener("click", () => {
    allMenus.forEach((menu) => menu.classList.add("hidden"));
    setMenuOpen(false);
    startGameCallback();
  });

  document.querySelectorAll(".back-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      show(mainMenu);
      setMenuOpen(true);
    })
  );

  document.getElementById("settings-btn").addEventListener("click", () => {
    show(settingsMenu);
    setMenuOpen(true);
  });

  document.getElementById("credits-btn").addEventListener("click", () => {
    show(creditsMenu);
    setMenuOpen(true);
  });

  document.getElementById("controls-btn").addEventListener("click", () => {
    show(controlsMenu);
    setMenuOpen(true);
  });

  // --------------------------------------------
  // Cookie Helpers
  // --------------------------------------------
  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expires}; path=/`;
  }

  function getCookie(name) {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  }

  // --------------------------------------------
  // Gamma & Ambient Sliders with Cookie Persistence
  // --------------------------------------------
  const gammaSlider = document.getElementById("gamma-slider");
  const ambientSlider = document.getElementById("ambient-slider");

  if (gammaSlider) {
    const savedGamma = getCookie("gamma");
    if (savedGamma) {
      gammaSlider.value = savedGamma;
      document.body.style.filter = `brightness(${savedGamma})`;
    }

    gammaSlider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      document.body.style.filter = `brightness(${value})`;
      setCookie("gamma", value);
    });
  }

  if (ambientSlider) {
    const savedAmbient = getCookie("ambient");
    if (savedAmbient) {
      ambientSlider.value = savedAmbient;
      if (window.ambientLight) {
        window.ambientLight.intensity = parseFloat(savedAmbient);
      } else {
        window.addEventListener("DOMContentLoaded", () => {
          if (window.ambientLight) {
            window.ambientLight.intensity = parseFloat(savedAmbient);
          }
        });
      }
    }

    ambientSlider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      if (window.ambientLight) {
        window.ambientLight.intensity = value;
      }
      setCookie("ambient", value);
    });
  }
}
