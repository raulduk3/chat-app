/**
 * @author Ricky Alvarez
 * @github https://github.com/raulduk3
 * @create date 2023-03-29 04:57:01
 * @modify date 2023-03-29 04:57:01
 * @desc Chat app server
 */
const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('./models/user');
const { Chatroom } = require('./models/chatroom');
const { hashString } = require('./utils/hash');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
	cors: {
	  origin: '*',
	  methods: ['GET', 'POST']
	}
  });

const port = 5005;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))

// ---- Server data ----------------------------------------------------------------------
const rooms = {};
const userDB = {
	'ra': {
		'username': 'ra',
		'email': 'alvarez1@kenyon.edu',
		'password': 'ra',
		'token': ''
	},
	'ra2': {
		'username': 'ra2',
		'email': 'alvarez1@kenyon.edu',
		'password': 'ra2',
		'token': ''
	},
	'js': {
		'username': 'js',
		'email': 'jskon@kenyon.edu',
		'password': 'js',
		'token': ''
	}
};
const activeUsers = {};

const joinRoom = function(room, token) {
	if(!rooms[room])
	{
		rooms[room] = new Chatroom(room, [token]);
	}
	else
	{
		if(!rooms[room].users.has(token))
		{
			rooms[room].users.add(token);
		}
	}
	return rooms[room].messages;
};

// ---- Verifies tokens ------------------------------------------------------------------
app.get('/', (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	
	console.log(activeUsers);

	let exists = activeUsers[req.query.token] ? true : false; 

	res.json({
		authed: exists,
	});
});

// ---- Register -------------------------------------------------------------------------
app.post('/chat/register/', (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	
	const now = new Date();
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;

	console.log(`${username} attempting to register.`);
	
	if (userDB[username] !== undefined || password.length < 6 || userDB[email] !== undefined ) {
		result = { status: 'failed' };
		res.redirect('http://3.22.149.75/restChat/')
		console.log(`${username} failed to register.`);
	} 
	else 
	{
		const user  = new User(username, email, password, '');
		
		userDB[username] = user;

		result = { status: 'success', user: username };
		res.redirect('http://3.22.149.75/restChat/?failed=0');
		
		console.log(user);
		console.log(`${username} registered.`)
	}	
});

// ---- Login ----------------------------------------------------------------------------
app.post('/chat/login', (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');

	const now = new Date();
	const username = req.body.username;
	const password = req.body.password;

	console.log(`${username} logging in.`);
	console.log(`${password} == ${userDB[username].password}`);
	// Check if the passwords match
	if(userDB[username].password == password)
	{
		let token = hashString(now.toString());
		let user = userDB[username];

		// ---- Login from one location ----------------------------------------------------------
		if(user.token !== '')
		{
			console.log(`${username} already logged in.`);
			res.redirect('http://3.22.149.75/restChat?failed=1');
			return;
		}

		activeUsers[token] = {
			username: user.username,
			room: 'g'
		};
		userDB[username] = new User(user.username, user.email, user.password, token);

		res.redirect('http://3.22.149.75/restChat/chat.html?token=' + token);
	
		console.log(`${username} logged in.`);
	}
	else
	{
		console.log(`${username} failed logging in.`);
		res.redirect('http://3.22.149.75/restChat?failed=1');
	}
});

// ---- Logout ---------------------------------------------------------------------------
app.get('/chat/logout', (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');

	userDB[activeUsers[req.query.token].username].token = '';
	rooms[activeUsers[req.query.token].room].users.delete(req.query.token);
	delete activeUsers[req.query.token];

	res.redirect('http://3.22.149.75/restChat');
});

// ---- Chat socket activeUsers[req.query.token]----------------------------------------------------------------------
io.on('connection', function(socket) {
	console.log(' > User connected');
	let currentUser;	

	// ---- Join -----------------------------------------------------------------------------
	socket.on('join', ({ token }) => {
		if(!activeUsers[token])
		{
			socket.emit('join', { status: 'fail' });
			
		}
		else
		{
			currentUser = { token: token, ...activeUsers[token] };
			let messages = joinRoom(currentUser.room, token);
			
			socket.join(currentUser.room);

			io.emit('updateList', { users: Object.values(activeUsers) });
			socket.emit('join', { status: 'success', user: currentUser.username, room: currentUser.room, messages: messages });
		}
	});
	
	// ---- Message --------------------------------------------------------------------------
	socket.on('message', ({ message, room, token }) => {
		let msg = {
			message: message,
			author: activeUsers[token],
			timeStamp: (new Date()).toUTCString()
		};
		rooms[room].messages.push(msg);
		io.to(room).emit('message', msg);
		console.log(`${activeUsers[token].username} sent "${message}" to ${room}`);
	});

	// ---- Logout ---------------------------------------------------------------------------
	socket.on('disconnect', () => {
		console.log(' > User disconnected');

		io.emit('updateList', { users: Object.values(activeUsers) });
	});
});


http.listen(port, () => {
	console.log(`Server listening  on localhost:${port}`);
});