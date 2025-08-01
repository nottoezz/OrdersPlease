// --------------------------------------------
// Intro Sequence Handling
// --------------------------------------------

// Set a cookie with optional expiry days (default: 1 year)
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Get a cookie by name
function getCookie(name) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

// Main function to run the intro sequence, or skip if already played
export function playIntroSequence(startGameCallback) {
  if (getCookie("introPlayed") === "true") {
    document.body.classList.add("menu-open");
    startGameCallback();
    return;
  }

  setCookie("introPlayed", "true");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "intro-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "black",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    fontFamily: "Courier New, monospace",
    fontSize: "1.5rem",
    textAlign: "center",
    padding: "2rem",
    transition: "opacity 1s ease"
  });

  // Title
  const title = document.createElement("div");
  title.textContent = "CHEF'S ORDERS";
  Object.assign(title.style, {
    fontSize: "3rem",
    marginBottom: "2rem",
    opacity: 1,
    transition: "opacity 2s ease"
  });
  overlay.appendChild(title);

  // Click to begin button
  const clickPrompt = document.createElement("button");
  clickPrompt.textContent = "Click to Begin";
  Object.assign(clickPrompt.style, {
    marginTop: "2rem",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    background: "transparent",
    border: "1px solid white",
    color: "white",
    cursor: "pointer",
    fontFamily: "inherit"
  });

  overlay.appendChild(clickPrompt);
  document.body.appendChild(overlay);

  // Click to begin logic
  clickPrompt.addEventListener("click", () => {
    clickPrompt.remove();
    title.style.opacity = 0;

    setTimeout(() => {
      title.remove();

      const introMusic = new Audio("./audio/intro_music.mp3");
      introMusic.loop = true;
      introMusic.volume = 0.2;
      introMusic.play();

      // Display story
      const story = document.createElement("div");
      Object.assign(story.style, {
        maxWidth: "800px",
        margin: "2rem auto",
        whiteSpace: "pre-wrap"
      });
      overlay.appendChild(story);

      const fullText =
        "You wake up in a cold, dimly-lit room.\n" +
        "Fluorescent lights flicker overhead. A terminal blinks silently beside you.\n\n" +
        "You don't remember how you got here.\n" +
        "But a note sits beside the screen: 'Serve the orders.'\n\n" +
        "You feel a chill—not just from the cold.";

      let i = 0;
      const typeText = () => {
        if (i < fullText.length) {
          story.textContent += fullText[i++];
          setTimeout(typeText, 70);
        } else {
          // Prompt to proceed
          const finalQuestion = document.createElement("div");
          finalQuestion.textContent = "Will you cook?";
          Object.assign(finalQuestion.style, {
            marginTop: "2rem",
            fontSize: "1.25rem",
            fontStyle: "italic"
          });

          const proceed = document.createElement("button");
          proceed.textContent = "Click to Proceed";
          Object.assign(proceed.style, {
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            background: "transparent",
            border: "1px solid white",
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit"
          });

          overlay.appendChild(finalQuestion);
          overlay.appendChild(proceed);

          proceed.addEventListener("click", () => {
            overlay.style.opacity = 0;
            introMusic.pause();
            introMusic.currentTime = 0;
            setTimeout(() => {
              overlay.remove();
              document.body.classList.add("menu-open");
              startGameCallback();
            }, 1000);
          });
        }
      };

      setTimeout(typeText, 1000);
    }, 2000);
  });
}
