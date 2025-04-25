// sage-chat.js

window.addEventListener("load", () => {
  // Wait a moment to ensure sage-chat.html was injected
  const waitForSigil = setInterval(() => {
    const sigilBtn = document.getElementById('sigil-btn');
    const chatContainer = document.getElementById('chat-container');
    const chatLog = document.getElementById('chat-log');
    const userInput = document.getElementById('user-input');

    if (sigilBtn && chatContainer && chatLog && userInput) {
      clearInterval(waitForSigil);

      sigilBtn.addEventListener('click', () => {
        chatContainer.style.display =
          chatContainer.style.display === 'flex' ? 'none' : 'flex';
      });

      window.sendMessage = function () {
        const message = userInput.value;
        if (message.trim() === '') return;

        appendMessage('You', message);
        userInput.value = '';

        setTimeout(async () => {
          const response = await generateSageResponse(message);
          appendMessage('The Sage', response);
        }, 600);
      };

      function appendMessage(sender, message) {
        const msgEl = document.createElement('div');
        msgEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatLog.appendChild(msgEl);
        chatLog.scrollTop = chatLog.scrollHeight;

        // Bind suggestion buttons if they exist
        msgEl.querySelectorAll('.suggestion').forEach(btn => {
          btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            window.sendMessage();
          });
        });
      }

      async function generateSageResponse(input) {
        const res = await fetch('/assets/lore.json');
        const lore = await res.json();
        const suggestions = lore["__suggestions"] || {};

        input = input.toLowerCase();
        for (const key in lore) {
          if (key === "__suggestions") continue;
          if (input.includes(key)) {
            let response = lore[key];
            if (suggestions[key]) {
              const links = suggestions[key]
                .map(s => `<button class='suggestion'>${s}</button>`)
                .join(" ");
              response += `<div class='suggestions'>${links}</div>`;
            }
            return response;
          }
        }

        return lore["default"] || "The stars are silent on that... for now.";
      }
    }
  }, 200); // Check every 200ms until elements exist
});