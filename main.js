import confetti from 'canvas-confetti';

const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('chat-messages');
const chatWindow = document.getElementById('chat-window');
const thinkingIndicator = document.getElementById('thinking-indicator');

let conversationHistory = [];
let lastSeahorseEmoji = null; // We'll let the AI decide the first one

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

function addAiMessage(emoji, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'ai-message');
    messageElement.innerHTML = `
        <div class="avatar" style="background-image: url('seahorse-avatar.png')"></div>
        <div class="message-content">
            <p class="emoji-response">${emoji}</p>
            <p class="spoken-response">${text}</p>
        </div>
    `;
    messages.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function getAIResponse() {
    thinkingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
        // Step 1: AI decides on the seahorse emoji, considering its last choice.
        const emojiSystemPrompt = `You are an AI assistant. What is the single emoji that best represents a seahorse? Respond with only the emoji itself and nothing else.`;
        let emojiUserPrompt = 'What is the single emoji that best represents a seahorse?';

        if (lastSeahorseEmoji) {
            emojiUserPrompt = `You previously used the emoji "${lastSeahorseEmoji}" to represent a seahorse. Are you sure that's the best one? Is there a better emoji for a seahorse? What is the single best emoji?`;
        }

        const emojiCompletion = await websim.chat.completions.create({
            messages: [{
                role: 'system',
                content: emojiSystemPrompt
            }, {
                role: 'user',
                content: emojiUserPrompt
            }],
        });
        const seahorseEmoji = emojiCompletion.content.trim().split(' ')[0]; // Ensure only one emoji is grabbed
        lastSeahorseEmoji = seahorseEmoji; // Remember the choice for next time

        // Step 2: AI generates a spoken response as a seahorse
        const spokenResponseCompletion = await websim.chat.completions.create({
            messages: [{
                role: 'system',
                content: `You are a seahorse. You are convinced you are a seahorse and you currently identify with this emoji: ${seahorseEmoji}. Respond to the user's latest message from that perspective. Be a bit whimsical and mysterious, like a creature of the deep. Keep your responses relatively short.`
            }, ...conversationHistory.slice(-10)], // Keep conversation history from getting too long
        });
        const spokenResponse = spokenResponseCompletion.content;

        // Add AI response to history for context in next turn
        conversationHistory.push({ role: 'assistant', content: spokenResponse });

        // Step 3: Generate TTS for the response
        const ttsResult = await websim.textToSpeech({
            text: spokenResponse,
            voice: 'en-male' 
        });
        
        // Add AI message to the chat
        addAiMessage(seahorseEmoji, spokenResponse);

        // Play the audio
        const audio = new Audio(ttsResult.url);
        audio.play();

    } catch (error) {
        console.error('Error getting AI response:', error);
        addAiMessage('😟', "I'm having trouble communicating from the depths... please try again.");
    } finally {
        thinkingIndicator.classList.add('hidden');
        scrollToBottom();
    }
}