const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const anonymousCheckbox = document.getElementById('anonymous-checkbox');

const roomId = window.location.pathname.slice(1);
const ws = new WebSocket(`ws://${window.location.host}/${roomId}`);

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'chat') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<span class="alias">${data.alias}:</span> ${data.message}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else if (data.type === 'settings') {
        anonymousCheckbox.checked = data.anonymous;
    }
};

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message) {
        ws.send(JSON.stringify({ type: 'chat', message }));
        messageInput.value = '';
    }
});

anonymousCheckbox.addEventListener('change', (e) => {
    const anonymous = e.target.checked;
    ws.send(JSON.stringify({ type: 'settings', anonymous }));
});
