'use strict';

const PORT = 3000;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const app = express();

const jsonParser = bodyParser.json();
app.use(cookieParser());

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/index.html`);
});

app.get('/scores', (req, res) => {
	new Promise((response, rej) => {
		let data = fs.readFileSync('./scores.json', 'utf-8');
		response(data);
		rej('something being wrong');
	})
	.then(response => res.send(response))
	.catch(console.log);
});

app.post('/scores', jsonParser, (req, res) => {
	fs.writeFileSync('./scores.json', JSON.stringify(req.body));
	res.send('data has been written');
});

app.get('/auth', (req, res) => {
	let {login} = req.cookies;
	let auth = !!login;
	res.send(JSON.stringify({auth, login}));
});

app.post('/auth', jsonParser, (req, res) => {
	let userData = fs.readFileSync('./users.json', 'utf-8');
	let auth = false;
	try {
		if (!userData) {
			userData = [];
		} else  {
			userData = JSON.parse(userData);
		}

		if (!userData.some(user => user == req.body[0]) || !userData.length) {
			userData.push(req.body[0]);
			fs.writeFileSync('./users.json', JSON.stringify(userData));
			auth = true;
			res.cookie('login', req.body[0], {maxAge: 86400000, httpOnly: true});
		}
		res.send(JSON.stringify({auth}));
	} catch(e) {
		console.log(e.message);
	}
});

app.listen(PORT, () => {
	console.log(`listen on port ${PORT}`);
});