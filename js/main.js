const socket = io("ws://18.119.139.37:5000");
const usersList = document.getElementById('users');
const registerForm = document.getElementById('register-form');

// Handle updates to the list of online users
socket.on('online-users', (users) => {
    usersList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user;
        usersList.appendChild(li);
    });
});

// Handle registration form submission
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    fetch('/chat/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((result) => {
        if (result.status === 'success') {
            console.log('Registration successful!');
        } else {
            console.error(result.message);
        }
    })
    .catch((err) => {
        console.error(err);
    });
});