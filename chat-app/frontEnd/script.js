const appServerURL = "http://localhost:3000/";
// const appServerURL =
//   "https://m-abdoon-chatapp-backend.hosting.codeyourfuture.io/";

const currentUser = prompt("Enter your name:") || "Unknown";
let lastTimestamp = 0;

async function setup() {
  await renderMessages();

  const messageText = document.getElementById("messageText");
  const submitMessage = document.getElementById("submitMessage");
  const messagesContainer = document.querySelector(".chat-messages");

  submitMessage.addEventListener("click", async (e) => {
    e.preventDefault();
    const message = messageText.value.trim();
    if (message) {
      const success = await sendMessage(message);
      if (success) {
        messageText.value = "";
        await renderMessages();
      } else {
        alert("Failed to send message. Please try again.");
      }
    }
  });

  messagesContainer.addEventListener("click", async (e) => {
    const likeButton = e.target.closest(".like-button");
    const dislikeButton = e.target.closest(".dislike-button");

    if (likeButton || dislikeButton) {
      const button = likeButton || dislikeButton;
      const messageId = button.dataset.id;
      const reaction = likeButton ? "like" : "dislike";

      const success = await reactToMessage(messageId, reaction);
      if (success) {
        await renderMessages();
      }
    }
  });

  setInterval(renderMessages, 500);
}

async function renderMessages() {
  const messages = await fetchMessages(lastTimestamp);
  const messagesContainer = document.querySelector(".chat-messages");
  messagesContainer.innerHTML = "";

  if (messages.length > 0) {
    lastTimestamp = Math.max(lastTimestamp, ...messages.map((m) => m.timestamp));
  }

  messages.sort((a, b) => a.timestamp - b.timestamp);
  appendMessages(messages);
}

function appendMessages(messages) {
  const messagesContainer = document.querySelector(".chat-messages");

  messages.forEach((message) => {
    const role = currentUser === message.sender ? "sent" : "received";

    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = `
      <span class="sender-name">${message.sender}</span>
      <p>${message.message}</p>
      <div class="reaction-row">
        <button class="reaction-button like-button" data-id="${message.id}">👍 ${message.likes || 0}</button>
        <button class="reaction-button dislike-button" data-id="${message.id}">👎 ${message.dislikes || 0}</button>
      </div>
    `;
    messagesContainer.appendChild(div);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function fetchMessages(lastTimestamp = 0) {
  try {
    const response = await fetch(
      `${appServerURL}getMessages?since=${lastTimestamp}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

async function sendMessage(message) {
  try {
    const response = await fetch(`${appServerURL}sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sender: currentUser }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    return false;
  }
}

async function reactToMessage(id, reaction) {
  try {
    const response = await fetch(`${appServerURL}reactMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reaction }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    return false;
  }
}

window.onload = setup;
