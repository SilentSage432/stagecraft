// sage-chat.js

window.addEventListener("load", () => {
  let loreCache = null; // Cache for lore.json

  // Wait for DOM elements to load
  const waitForSigil = setInterval(() => {
    const sigilBtn = document.getElementById('sigil-btn');
    const chatContainer = document.getElementById('chat-container');
    const chatLog = document.getElementById('chat-log');
    const userInput = document.getElementById('user-input');

    if (sigilBtn && chatContainer && chatLog && userInput) {
      clearInterval(waitForSigil);

      // Toggle chat visibility
      sigilBtn.addEventListener('click', () => {
        chatContainer.style.display =
          chatContainer.style.display === 'flex' ? 'none' : 'flex';
      });


      // Append message to chat log
      function appendMessage(sender, message) {
        const msgEl = document.createElement('div');
        msgEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatLog.appendChild(msgEl);
        chatLog.scrollTop = chatLog.scrollHeight;

        // Bind suggestion buttons
        msgEl.querySelectorAll('.suggestion').forEach(btn => {
          btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            window.sendMessage();
          });
        });
      }

      // Generate response from lore.json
      async function generateSageResponse(input, original) {
        try {
          // Load lore.json if not cached
          if (!loreCache) {
            const res = await fetch('/assets/lore.json'); // Add ?cachebust=' + Date.now() if caching issues persist
            if (!res.ok) throw new Error('Failed to load lore.json');
            loreCache = await res.json();
          }
          const lore = loreCache;
          const suggestions = lore["__suggestions"] || {};

          // Normalize input
          input = input.toLowerCase().replace(/[^\w\s]/gi, '').trim();
          console.log("Normalized input:", input);
          console.log("Original input:", original);

          // Create normalized key mapping
          const normalizedKeys = Object.keys(lore).reduce((acc, key) => {
            if (key !== "__suggestions" && key !== "default") {
              const norm = key.toLowerCase().replace(/[^\w\s]/gi, '').trim();
              acc[norm] = key;
            }
            return acc;
          }, {});

          // Add suggestions as matchable keys
          Object.keys(suggestions).forEach(key => {
            suggestions[key].forEach(sug => {
              const normSug = sug.toLowerCase().replace(/[^\w\s]/gi, '').trim();
              normalizedKeys[normSug] = key; // Map suggestion to base key
            });
          });
          console.log("Normalized keys:", normalizedKeys);

          // Check for exact match
          if (normalizedKeys[input]) {
            const originalKey = normalizedKeys[input];
            console.log("Matched key:", originalKey);
            let response = lore[originalKey];
            if (suggestions[originalKey]) {
              const links = suggestions[originalKey]
                .map(s => `<button class='suggestion'>${s}</button>`)
                .join(" ");
              response += `<div class='suggestions'>${links}</div>`;
            }
            console.log("Response:", response);
            return response;
          }

          // Check for partial keyword match
          const inputWords = input.split(' ');
          for (const word of inputWords) {
            if (normalizedKeys[word]) {
              const originalKey = normalizedKeys[word];
              console.log("Partial matched key:", originalKey);
              let response = lore[originalKey];
              if (suggestions[originalKey]) {
                const links = suggestions[originalKey]
                  .map(s => `<button class='suggestion'>${s}</button>`)
                  .join(" ");
                response += `<div class='suggestions'>${links}</div>`;
              }
              console.log("Partial response:", response);
              return response;
            }
          }

          // Fallback to default
          console.log("No match found, using default");
          return `<em>${lore["default"] || "The stars are silent on that... for now."}</em>`;
        } catch (error) {
          console.error("Error in generateSageResponse:", error);
          return `<em>Sorry, I'm unable to access my knowledge right now.</em>`;
        }
      }
    }
  }, 200); // Check every 200ms until elements exist
});