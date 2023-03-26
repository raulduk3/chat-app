const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mariadb = require('mariadb');

const PORT = process.env.PORT || 3000;

const pool = mariadb.createPool({
	host: 'localhost',
	user: 'root',
	password: 'newpassword',
	database: 'chatapp'
});

app.use(express.json());
app.use(express.static(__dirname + '/dist'));

app.get('/users', async (req, res) => {
	const conn = await pool.getConnection();
	const rows = await conn.query('SELECT username FROM users');
	conn.release();
	res.json(rows);
});

app.post('/chat/register', async (req, res) => {
	const { username, email, password } = req.body;
	const conn = await pool.getConnection();
	try {
		const userExists = await conn.query(
			'SELECT COUNT(*) as count FROM users WHERE username=? OR email=?',
			[username, email]
			);
			if (userExists[0].count > 0) {
				throw new Error('Username or email already exists');
			}
			if (password.length < 6) {
				throw new Error('Password must be at least 6 characters long');
			}
			await conn.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
				username,
				email,
				password
			]);
			res.json({ status: 'success' });
		} catch (err) {
			res.status(400).json({ status: 'fail', message: err.message });
		} finally {
			conn.release();
		}
	});
	
	server.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});
	