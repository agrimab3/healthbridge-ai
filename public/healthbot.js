let isTyping = false;
let messageCount = 0;

// Initial greeting
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const chatlog = document.getElementById("chatlog");
    chatlog.innerHTML = '';
    addBotMessage("👋 Hi there! I'm HealthBot, your personal health assistant. I can help you with:");
    setTimeout(() => {
      addBotMessage("• Understanding symptoms and when to seek care\n• Nutrition and healthy eating tips\n• Preventive health measures\n• Finding local health resources\n\nWhat would you like to know?");
    }, 1000);
  }, 500);
});

async function sendMessage() {
  const input = document.getElementById("chatinput");
  const userMessage = input.value.trim();
  
  if (!userMessage || isTyping) return;

  // Add user message
  addUserMessage(userMessage);
  input.value = "";
  messageCount++;

  // Show typing indicator
  isTyping = true;
  const typingId = showTypingIndicator();

  try {
    const res = await fetch("/healthbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });

    if (!res.ok) {
      throw new Error('Failed to get response');
    }

    const data = await res.json();
    
    // Remove typing indicator
    removeTypingIndicator(typingId);
    
    // Add bot response with slight delay for natural feel
    setTimeout(() => {
      addBotMessage(data.reply);
      isTyping = false;
    }, 500);

  } catch (error) {
    console.error('Error:', error);
    removeTypingIndicator(typingId);
    addBotMessage("I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🔄");
    isTyping = false;
  }
}

function addUserMessage(text) {
  const chatlog = document.getElementById("chatlog");
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message message-user';
  messageDiv.innerHTML = `
    <div class="message-label">You</div>
    <div class="message-content">${escapeHtml(text)}</div>
  `;
  chatlog.appendChild(messageDiv);
  scrollToBottom();
}

function addBotMessage(text) {
  const chatlog = document.getElementById("chatlog");
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message message-bot';
  
  // Format the message to preserve line breaks and structure
  const formattedText = formatBotMessage(text);
  
  messageDiv.innerHTML = `
    <div class="message-label">HealthBot</div>
    <div class="message-content">${formattedText}</div>
  `;
  chatlog.appendChild(messageDiv);
  scrollToBottom();
}

function showTypingIndicator() {
  const chatlog = document.getElementById("chatlog");
  const typingDiv = document.createElement('div');
  const id = `typing-${Date.now()}`;
  typingDiv.id = id;
  typingDiv.className = 'message message-bot';
  typingDiv.innerHTML = `
    <div class="message-label">HealthBot</div>
    <div class="message-content">
      <span class="loading"></span>
      <span class="loading" style="animation-delay: 0.2s;"></span>
      <span class="loading" style="animation-delay: 0.4s;"></span>
      Thinking...
    </div>
  `;
  chatlog.appendChild(typingDiv);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

function formatBotMessage(text) {
  // Escape HTML but preserve line breaks
  text = escapeHtml(text);
  
  // Convert line breaks to <br>
  text = text.replace(/\n/g, '<br>');
  
  // Make bullet points prettier
  text = text.replace(/•/g, '<span style="color: #667eea;">•</span>');
  
  // Bold text between ** **
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  return text;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function scrollToBottom() {
  const chatlog = document.getElementById("chatlog");
  chatlog.scrollTop = chatlog.scrollHeight;
}

// Provide helpful suggestions
function suggestQueries() {
  const suggestions = [
    "What should I do if I have a fever?",
    "Tell me about healthy eating habits",
    "How can I prevent the flu?",
    "What are signs of dehydration?",
    "Tips for better sleep"
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// Add quick action buttons if needed
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chatinput');
  if (messageCount === 0) {
    input.placeholder = "Try: 'What should I eat for better health?' or 'When should I see a doctor?'";
  }
});