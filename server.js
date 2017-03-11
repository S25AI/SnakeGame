'use strict';

const PORT = 3000;

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

const jsonParser = bodyParser.json();

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

app.listen(PORT, () => {
	console.log(`listen on port ${PORT}`);
});