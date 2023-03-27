const socket = io('http://localhost:3000');

// Login form
const loginForm = document.querySelector('#login-form');
const loginButton = document.querySelector('#login-btn');
const loginUsername = document.querySelector('#login-username');
const loginPassword = document.querySelector('#login-password');

// Register form
const registerForm = document.querySelector('.register-form');
const registerButton = document.querySelector('#register-button');

// Chat form
const chatForm = document.querySelector('#chat-form');
const chatMessage = document.querySelector('#message-input');
const chatMessages = document.querySelector('#messages');
const chatUserList = document.querySelector('#user-list');
const chatLogoutButton = document.querySelector('#logout-btn');
const sendButton = document.querySelector('#send-btn')

// Login form submission
loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    
    const username = loginUsername.value;
    const password = loginPassword.value;
    
    const response = await fetch('http://localhost:3000/chat/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        loginForm.classList.add('hidden');
        chatForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        
        socket.emit('join', username);
    } else {
        alert('Invalid username or password');
    }
});

// Chat form submission
sendButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const message = chatMessage.value;
    
    socket.emit('sendMessage', { username: document.cookie, message: message });
    
    chatMessage.value = '';
});

// Logout button click
chatLogoutButton.addEventListener('click', async () => {
    const response = await fetch('http://localhost:3000/chat/logout', {
        method: 'POST',
    });

    if (response.ok) {
        loginForm.classList.remove('hidden');
        registerForm.classList.remove('hidden');
        chatForm.classList.add('hidden');
        socket.disconnect();
    }
});

// Register button click
registerButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const username = document.querySelector('#register-username').value;
    const email = document.querySelector('#register-email').value;
    const password = document.querySelector('#register-password').value;
    
    fetch('http://localhost:3000/chat/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => {
        if (response.ok) {
            // Registration was successful
            alert('Registration successful!');
        } else {
            // Registration failed
            response.json().then(data => {
                alert(data.message);
            });
        }
    })
    .catch(error => {
        console.error(error);
        alert('Registration failed');
    });
});

// Add user to user list
socket.on('userList', (users) => {
    chatUserList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user.username;
        chatUserList.appendChild(li);
    });
});

// Add message to message list
socket.on('message', (data) => {
    const li = document.createElement('li');
    li.textContent = `${data.username}: ${data.message}`;
    chatMessages.appendChild(li);
});
