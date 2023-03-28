const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('./models/user');
const { Chatroom } = require('./models/chatroom');
const { hashString } = require('./utils/hash');

const port = 5005;

const app = express();
app.use(bodyParser.json());

const rooms = new Map();
const userDB = new Map();
const activeUsers = new Set();

app.get('/', (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.send('Chat API');
});

app.post('/chat/register', (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	const now = new Date();
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	
	let result;
	console.log(`${username} registered.`);
	
	// Check if user with this name exists
	if (userDB.has(username)) {
		result = { status: 'exists' };
	} else {
		// Add user to userrDB map
		const user = new User(username, email, password, hashString(''));
		userDB.set(username, user);
		result = { status: 'success', user: username };
	}
	res.json(result);
});

console.log(`Server listening on port ${port}`);
app.listen(port);