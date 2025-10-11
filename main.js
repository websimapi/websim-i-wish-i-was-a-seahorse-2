import confetti from 'canvas-confetti';

const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('chat-messages');
const chatWindow = document.getElementById('chat-window');
const thinkingIndicator = document.getElementById('thinking-indicator');

let conversationHistory = [];

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    addUserMessage(userInput);
    conversationHistory.push({ role: 'user', content: userInput });
    input.value = '';

    await getAIResponse();
});

function addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
        <div class="avatar" style="background-image: url('user-avatar.png')"></div>
    `;
    messages.appendChild(messageElement);
    scrollToBottom();
}

async function getAIResponse() {
    thinkingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
        // Step 1: AI decides on the seahorse emoji
        const emojiCompletion = await websim.chat.completions.create({
            messages: [{
                role: 'system',
                content: 'You are an AI assistant. What is the single emoji that best represents a seahorse? Respond with only the emoji itself and nothing else.'
            }, {
                role: 'user',
                content: 'seahorse emoji'
            }],
        });
        const seahorseEmoji = emojiCompletion.content.trim();

        // Step 2: AI generates a spoken response as a seahorse
        const spokenResponseCompletion = await websim.chat.completions.create({
            messages: [{
                role: 'system',
                content: `You are a seahorse. You are convinced you are a seahorse. Respond to the user's latest message from

