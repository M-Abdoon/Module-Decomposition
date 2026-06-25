const appServerURL = "http://localhost:3000/";
// const appServerURL = "https://m-abdoon-chatapp-backend.hosting.codeyourfuture.io/";

const currentUser = prompt("Enter your name:") || "Unknown";

let lastTimestamp = 0;

async function setup() {
  await renderMessages();

  const messageText = document.getElementById("messageText");
  const submitMessage = document.getElementById("submitMessage");

  submitMessage.addEventListener("click", async (e) => {
    e.preventDefault();
    const message = messageText.value.trim();
    if (message) {
      const success = await sendMessage(message);
      if (success) {
        messageText.value = "";
      } else {
        alert("Failed to send message. Please try again.");
      }
    }
  });

  setInterval(pollNewMessages, 500);
}

async function pollNewMessages() {
  const newMessages = await fetchMessages(lastTimestamp);
  if (newMessages.length > 0) {
    appendMessages(newMessages);
  }
}

async function renderMessages() {
  const messages = await fetchMessages(0);
  messages.sort((a, b) => a.timestamp - b.timestamp);
  appendMessages(messages);
}

function appendMessages(messages) {
  const messagesContainer = document.querySelector(".chat-messages");
  messages.sort((a, b) => a.timestamp - b.timestamp);

  messages.forEach((message) => {
    const role = currentUser === message.sender ? "sent" : "received";

    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = `
      <span class="sender-name">${message.sender}</span>
      <p>${message.message}</p>
    `;
    messagesContainer.appendChild(div);

    if (message.timestamp > lastTimestamp) {
      lastTimestamp = message.timestamp;
    }
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

window.onload = setup;
