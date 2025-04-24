// sage-chat.js

document.addEventListener("DOMContentLoaded", () => {
    const sigilBtn = document.getElementById('sigil-btn');
    const chatContainer = document.getElementById('chat-container');
    const chatLog = document.getElementById('chat-log');
    const userInput = document.getElementById('user-input');
  
    sigilBtn.addEventListener('click', () => {
      chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
    });
  
    window.sendMessage = function () {
      const message = userInput.value;
      if (message.trim() === '') return;
  
      appendMessage('You', message);
      userInput.value = '';
  
      setTimeout(() => {
        const response = generateSageResponse(message);
        appendMessage('The Sage', response);
      }, 600);
    }
  
    function appendMessage(sender, message) {
      const msgEl = document.createElement('div');
      msgEl.innerHTML = `<strong>${sender}:</strong> ${message}`;
      chatLog.appendChild(msgEl);
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  
    function generateSageResponse(input) {
      const responses = [
        "The winds speak of hidden truths. Listen closely.",
        "A path veiled in shadow often holds the brightest flame.",
        "You seek an answer, but the question must first find you.",
        "What you desire may not be what you need, seeker.",
        "The veil stirs. A whisper forms. Do you hear it?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  });