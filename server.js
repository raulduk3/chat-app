const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');

const app = express();
const server = require('http').createServer(app);
const io = socketio(server, {
	cors: {
		origin: '*',
	},
});

// MariaDB Connection Pool
const pool = mariadb.createPool({
	host: 'localhost',
	user: 'root',
	password: '123',
	database: 'chatapp',
	connectionLimit: 5,
});

// Middleware
app.use(express.json());
app.use(cors());

// * Active users *
let active_users = {};

// Register API
app.post('/chat/register', async (req, res) => {
	const { username, email, password } = req.body;
	
	// Check if username already exists
	const usernameExists = await pool.query(
		`SELECT * FROM users WHERE username = ?`,
		[username]
	);
		
	if (usernameExists.length > 0) {
		return res.status(400).json({ message: 'Username already exists' });
	}

	// Check if email already exists
	const emailExists = await pool.query(
		`SELECT * FROM users WHERE email = ?`,
		[email]
	);

	if (emailExists.length > 0) {
		return res.status(400).json({ message: 'Email already exists' });
	}

	// Check password length
	if (password.length < 6) {
		return res
		.status(400)
		.json({ message: 'Password must be at least 6 characters long' });
	}

	// Hash password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Insert user into database
	const result = await pool.query(
		`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
		[username, email, hashedPassword]
	);

	if (result.affectedRows === 1) {
		return res.status(201).json({ message: 'User registered successfully' });
	} else {
		return res.status(500).json({ message: 'Something went wrong' });
	}
});

// Login API
app.post('/chat/login', async (req, res) => {
	const { username, password } = req.body;

	console.log(username + ' ' + password);

	// Check if user exists
	const user = await pool.query(
		`SELECT * FROM users WHERE username = ?`,
		[username]
	);

	if (user.length === 0) {
		return res.status(401).json({ message: 'Invalid username or password' });
	}

	// Compare passwords
	const isPasswordCorrect = await bcrypt.compare(password, user[0].password);

	if (!isPasswordCorrect) {
		return res.status(401).json({ message: 'Invalid username or password' });
	}

	// Create and sign JWT
	const token = jwt.sign(
		{
			id: user[0].id,
			username: user[0].username,
		},
		'secret',
		{ expiresIn: '1h' }
	);
		
	// Return JWT as a cookie
	res.cookie('jwt', token, {
		httpOnly: true,
		maxAge: 60 * 60 * 1000,
	});

	active_users[token] = ({
		id: user[0].id,
		username: user[0].username,
		token: token
	});
		
	return res.status(200).json({ message: 'Logged in successfully' });
});

// Logout API
app.post('/chat/logout', async (req, res) => {
	// Clear JWT cookie
	res.clearCookie('jwt');
	
	return res.status(200).json({ message: 'Logged out successfully' });
});

// Chat API
app.get('/chat', async (req, res) => {
	// Verify JWT
	const token = req.cookies.jwt;
	
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	
	try {
		const decoded = jwt.verify(token, 'secret');
		req.user = decoded;
		return res.status(200).json({ message: 'Authorized' });
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
});

io.on('connection', (socket) => {
	console.log('User connected');
	
	// Add user to users array
	socket.on('join', (token) => {
		console.log(active_users);

		if(active_users[token]){
			io.emit('userList', users);
		}
	});
	
	// Remove user from users array
	socket.on('disconnect', () => {
		try {
			delete active_users[token];
		}
		catch {
			console.log("[ERROR] Not currently an active user...");
		}
		console.log(active_users);
	});
	
	// Send message to all users
	socket.on('sendMessage', ({token, message}) => {
		if(active_users[token]){
			io.emit('message', { socketid: socket.id, message: message, username: active_users[token].username });
		}
	});
});

// Start server
server.listen(3000, () => {
	console.log('Server started on port 3000');
});
